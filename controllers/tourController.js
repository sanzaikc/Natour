const multer = require('multer');
const sharp = require('sharp');

const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const Tour = require('./../models/tourModel');

const imageDestination = 'public/img/tours/';

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else
    cb(
      new AppError('Not an image! Please upload image files only', 400),
      false
    );
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1300, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(`${imageDestination}${req.body.imageCover}`);

  // Tour Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1300, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(`${imageDestination}${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        totalTours: { $sum: 1 },
        totalRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        totalTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
        totalTours: 1,
        tours: 1,
        month: 1,
      },
    },
    {
      $sort: { totalTours: -1 },
    },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    totalItems: plans.length,
    data: {
      plans,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!unit) return next(new AppError('Please provide unit in mi or km', 400));

  if (!lat || !lng)
    return next(
      new AppError('Please provide geo location in the form lat,lng', 400)
    );

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
    totalItems: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!unit) return next(new AppError('Please provide unit in mi or km', 400));

  const multiplier = unit === 'km' ? 0.001 : 0.000621371;

  if (!lat || !lng)
    return next(
      new AppError('Please provide geo location in the form lat,lng', 400)
    );

  // NOTE: To aggregate geospatial data we need to make sure there exist a geospatial index in the model
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    totalItems: distances.length,
    data: {
      data: distances,
    },
  });
});
