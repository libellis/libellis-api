const express = require('express');
const router = new express.Router();
const Question = require('../models/question');
const createQuestionSchema = require('../schema/createQuestion.json')
const validateInput = require('../middleware/validation');
const { ensureLoggedIn, ensureAuthor } = require('../middleware/auth');


/** get a list of questions for a given survey id 
 *  take it in from query string like -> ?survey=1
*/

router.get('/', async function (req, res, next) {
  try {
    const survey_id = req.query.survey_id;
    const questions = await Question.getAll({ survey_id });

    return res.json({ questions });
  } catch (error) {
    return next(error);
  }
}
);

/** get a question by id */
router.get('/:id', async function (req, res, next) {
  try {
    const question = await Question.get(req.params.id);
    return res.json({ question })
  } catch (err) {
    return next(err);
  }
});

/**  create a new question */
router.post('/', ensureLoggedIn, validateInput(createQuestionSchema), async function (req, res, next) {
  try {
    const question = await Question.create(req.body);
    return res.json({ question });
  } catch (error) {
    return next(error);
  }
});


// /** update a question */
// router.patch('/:id', ensureLoggedIn, ensureAuthor, async function (req, res, next) {
//   try {
//     let { title, description } = req.body;
//     if (!title && !description) return "Nothing to update";

//     let question = req.question;
//     question.title = title || question.title;
//     question.description = description || question.description;
//     await question.save();

//     return res.json({ question })
//   } catch (err) {
//     return next(err);
//   }
// });

// /** delete a question */
// router.delete('/:id', ensureLoggedIn, ensureAuthor, async function (req, res, next) {
//   try {
//     let question = req.question;

//     await question.delete();

//     return res.json('Deleted');
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
