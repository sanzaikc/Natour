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
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// SETTING UP SERVER-SIDE RENDER ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// SECURITY HTTP HEADERS
app.use(helmet());

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
  next();
});

app.use((req, res, next) => {
  res.status(200).render('base');
});

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
