/** Express app for jobly. */

/***************************************************** */
/** set NODE_ENV to development, remove when deploying */
// process.env.NODE_ENV = 'development';
/***************************************************** */


const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const surveyRouter = require('./routes/surveys');
const questionRouter = require('./routes/questions');
const voteRouter = require('./routes/votes');
// const choicesRouter = require('./routes/choices');

// add logging system
if (process.env.NODE_ENV === 'development' ) {
  const morgan = require('morgan');
  app.use(morgan('tiny'));
}
app.use(cors());

surveyRouter.use('/:id/questions', questionRouter);
surveyRouter.use('/:id/votes', voteRouter);

// add routes here
app.use(authRouter);
app.use('/users', userRouter);
app.use('/surveys', surveyRouter);
// app.use('/choices', choicesRouter);

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
    error: err.message,
  });
});

module.exports = app;
