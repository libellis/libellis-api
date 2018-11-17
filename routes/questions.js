const express = require('express');
const router = new express.Router({mergeParams: true});
const Question = require('../models/question');
const Choice = require('../models/choice');
const createQuestionSchema = require('../schema/createQuestion.json');
const updateQuestionSchema = require('../schema/updateQuestion.json');
const validateInput = require('../middleware/validation');
const {ensureLoggedIn, ensureAuthor} = require('../middleware/auth');

/** get a list of questions for a given survey id
 *  must get it from :id now that we are nested
 *  and check authorship
 */

router.get('/', async function(req, res, next) {
  try {
    const survey_id = req.params.id;
    const questions = await Question.getAll({survey_id});
    return res.json({questions});
  } catch (error) {
    return next(error);
  }
});

/** get a question by id
  * and return it with array of choices on it
  *
 */ 
router.get('/:question_id', async function(req, res, next) {
  try {
    const question = await Question.get(req.params.question_id);
    const choices = await Choice.getAll({ question_id: req.params.question_id });
    question.choices = choices;
    return res.json({question});
  } catch (err) {
    return next(err);
  }
});

/**  create a new question */
router.post(
  '/',
  validateInput(createQuestionSchema),
  ensureLoggedIn,
  ensureAuthor,
  async function(req, res, next) {
    try {
      const newQuestion = req.body;
      newQuestion.survey_id = req.params.id;
      const question = await Question.create(newQuestion);
      // now that we've created the question, let's create
      // the choices if they were submitted with question
      if (newQuestion.choices) {
        for (const choice of newQuestion.choices) {
          const newChoice = {...choice, question_id: question._id}
          console.log('New Choice:', newChoice);
          await Choice.create(newChoice);
        }
      }
       
      // now that we have created all choices, let's retrieve them and attach
      // to question that was returned  
      const choices = await Choice.getAll({ question_id: question._id });
      question.choices = choices;

      return res.json({question});
    } catch (error) {
      return next(error);
    }
  },
);

/** update a question */
router.patch(
  '/:question_id',
  validateInput(updateQuestionSchema),
  ensureLoggedIn,
  ensureAuthor,
  async function(req, res, next) {
    try {
      let question = await Question.get(req.params.question_id);
      question.updateFromValues(req.body);
      await question.save();
      return res.json({question});
    } catch (err) {
      return next(err);
    }
  },
);

/** delete a question */
router.delete(
  '/:question_id', 
  ensureLoggedIn, 
  ensureAuthor, 
  async function(req, res, next) {
  try {
    let question = await Question.get(req.params.question_id);
    let resp = await question.delete();
    return res.json(resp);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
