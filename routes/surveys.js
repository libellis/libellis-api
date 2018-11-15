const express = require('express');
const router = new express.Router();
const Survey = require('../models/survey');
const Question = require('../models/question');

const createSurveySchema = require('../schema/createSurvey.json')
const patchSurveySchema = require('../schema/patchSurvey.json')
const validateInput = require('../middleware/validation');
const { ensureLoggedIn, ensureAuthor } = require('../middleware/auth');


/** get a list of surveys */
router.get('/', async function (req, res, next) {
  try {
    console.log(req.query);
    let { search } = req.query;
    const surveys = await Survey.getAll({search});
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
router.patch('/:id', ensureLoggedIn, ensureAuthor, validateInput(patchSurveySchema), async function(req, res, next) {
  try {
    let survey = req.survey;
    survey.updateFromValues(req.body);
    await survey.save();
    return res.json({survey})
  } catch (err) {
    return next(err);
  }
});

/** delete a survey */
router.delete('/:id', ensureLoggedIn, ensureAuthor, async function(req, res, next) {
  try {
    let survey = req.survey;

    await survey.delete();

    return res.json('Deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;