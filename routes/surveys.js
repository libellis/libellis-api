const express = require('express');
const router = new express.Router();
const Survey = require('../models/survey');
const Question = require('../models/question');

const createSurveySchema = require('../schema/createSurvey.json')
const patchSurveySchema = require('../schema/patchSurvey.json')
const validateInput = require('../middleware/validation');
const { ensureLoggedIn, ensureAuthor } = require('../middleware/auth');


/** get a list of surveys
 * accepts a query param of "search" to filter results
 * 
 * responds with a an array of surveys with top level data
 */
router.get('/', async function (req, res, next) {
  try {
    let { search } = req.query;
    const surveys = await Survey.getAll(search);
    return res.json({
      surveys
    });
  } catch (error) {
    return next(error);
  }
});

/** get a survey by id 
 * 
 * responds with a survey object with top level data
 * with an array of questions with top level data
*/
router.get('/:id', async function (req, res, next) {
  try {
    const survey = await Survey.get(req.params.id);
    survey.questions = await Question.getAll({ survey_id: survey.id });
    return res.json({survey})
  } catch (err) {
    return next(err);
  }
});

/** create a new survey 
 * accepts a title and description as JSON
 * 
 * responds with a survey objject with top level data
*/
router.post('/', ensureLoggedIn, validateInput(createSurveySchema), async function (req, res, next) {
  try {
    let { title, description, category } = req.body
    const survey = await Survey.create({author: req.username, title, description, category });
    return res.json({
      survey
    });
  } catch (error) {
    return next(error);
  }
});


/** update a survey 
 * 
 * responds with a survey object with top level data
*/
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

/** delete a survey 
 * 
 * responds with message
*/
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
