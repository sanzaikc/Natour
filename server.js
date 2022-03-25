const mongoose = require('mongoose');
const dotenv = require('dotenv');

// CATCH UNCAUGHT EXPECTION
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTIONS! Shutting down the application');
  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// CATCH UNHANDLED REJECTION
process.on('unhandledRejection', (err) => {
  console.log(err.name);
  console.log('UNHANDLED REJECTION! Shutting down the application');
  server.close(() => {
    process.exit(1);
  });
});
