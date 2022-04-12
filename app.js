const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const authRouter = require('./routes/authRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// SETTING UP SERVER-SIDE RENDER ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// SECURITY HTTP HEADERS
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/0.26.1/axios.js',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/0.26.1/axios.js',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// DEVELOPMENT LOGGER
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// RATE LIMIT OF 100 REQUEST PER HOUR FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this IP, please try in an hour',
});
app.use('/api', limiter);

// BODY PARSER
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTIONS
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMS POLLUTION
app.use(
  hpp({
    whitelist: [
      'difficulty',
      'duration',
      'maxGroupSize',
      'price',
      'ratingsQuantity',
    ],
  })
);

// SERVER STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// OVERIDING REQUEST OBJECT
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// VIEW ROUTES
app.use('/', viewRouter);

// API ROUTES
const baseUrl = '/api/v1';

app.use(`${baseUrl}`, authRouter);
app.use(`${baseUrl}/tours`, tourRouter);
app.use(`${baseUrl}/users`, userRouter);
app.use(`${baseUrl}/reviews`, reviewRouter);

// INVALID ROUTE HANLDER
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

// GLOBAL OPERATIONAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
