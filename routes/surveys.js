const express = require('express');
const router = new express.Router();
const Survey = require('../models/survey');
const Question = require('../models/question');

const createSurveySchema = require('../schema/createSurvey.json')
const validateInput = require('../middleware/validation');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');


/** get a list of surveys */
router.get('/', async function (req, res, next) {
  try {
    const surveys = await Survey.getAll();
    const questionPromises = surveys.map(survey => Question.getAll({survey_id: survey.id}));
    const questions = await Promise.all(questionPromises);

    for (let i=0; i<surveys.length; i++)
      surveys[i].questions = questions[i];
    
      return res.json({
      surveys
    });
  } catch (error) {
    return next(error);
  }
});

/** get a survey by id */
router.get('/:id', async function (req, res, next) {
  try {
    const survey = await Survey.get(req.params.id);
    survey.questions = await Question.getAll({ survey_id: survey.id });

    return res.json({survey})
  } catch (err) {
    return next(err);
  }
});

/**  create a new survey */
router.post('/', ensureLoggedIn, validateInput(createSurveySchema), async function (req, res, next) {
  try {
    let { title, description } = req.body
    const survey = await Survey.create({author: req.username, title, description });

    return res.json({
      survey
    });
  } catch (error) {
    return next(error);
  }
});


/** update a survey */
router.patch('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    let { title, description } = req.body;
    if (!title && !description) return "Nothing to update";
    
    const survey = await Survey.get(req.params.id);

    // if user is not author of survey, throw 401
    if (survey.author !== req.username) {
      let err = new Error('Not Authorized to edit');
      err.status = 401;
      throw err;
    }

    survey.title = title || survey.title;
    survey.description = description || survey.description;
    await survey.save();

    return res.json({survey})
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
  try {

    const survey = await Survey.get(req.params.id);

    // if user is not author of survey, throw 401
    if (survey.author !== req.username) {
      let err = new Error('Not Authorized to delete');
      err.status = 401;
      throw err;
    }

    await survey.delete();

    return res.json('Deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;