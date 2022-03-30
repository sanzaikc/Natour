const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const authRouter = require('./routes/authRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// SECURITY HTTP HEADERS
app.use(helmet());

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

// SERVER STATIC FILES
app.use(express.static(`${__dirname}/public`));

// OVERIDING REQUEST OBJECT
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const baseUrl = '/api/v1';

app.use(`${baseUrl}`, authRouter);
app.use(`${baseUrl}/tours`, tourRouter);
app.use(`${baseUrl}/users`, userRouter);

// INVALID ROUTE HANLDER
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

// GLOBAL OPERATIONAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
