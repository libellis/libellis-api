/** Express app for jobly. */

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
// const surveyRoutes = require('./routes/surveys');
// const questionRoutes = require('./routes/questions');
// const choicesRoutes = require('./routes/choices');

// add logging system

const morgan = require('morgan');
app.use(morgan('tiny'));

// add routes here
app.use(authRoutes);
app.use('/users', userRoutes);
// app.use('/surveys', surveyRoutes);
// app.use('/questions', questionRoutes);
// app.use('/choices', choicesRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
