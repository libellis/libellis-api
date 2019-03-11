const express = require('express');
const router = new express.Router({mergeParams: true});
// const Survey = require('../models/survey');
// const Question = require('../models/question');
// const Choice = require('../models/choice');
// const Vote = require('../models/vote');
// const { validateVotes } = require('../helpers/scores');
// const db = require('../db');
//
// const createQuestionSchema = require('../schema/createQuestion.json');
// const updateQuestionSchema = require('../schema/updateQuestion.json');
// const validateInput = require('../middleware/validation');
// const {ensureLoggedIn, ensureAuthor} = require('../middleware/auth');
//
//
// /** get */
// router.get('/',  async function(req, res, next) {
//   try {
//     const survey_id = req.params.id;
//
//     // get all question id's for this survey
//     const result = await db.query(
//       `SELECT id FROM questions WHERE survey_id=$1`,
//       [survey_id]
//     );
//
//     let survey_votes = [];
//     for (const question of result.rows) {
//       let vote_results = await Vote.getAll({question_id: question.id});
//       survey_votes.push({question_id: question.id, vote_results});
//     }
//     return res.json({results: survey_votes});
//   } catch (error) {
//     return next(error);
//   }
// });
//
// /** 
//  * post 
//  * 
//  * { username, survey_id, question_id, choice_id }
//  * */
//
//
// router.post('/', ensureLoggedIn, async function(req, res, next) {
//   try {
//     const survey_id = req.params.id;
//     const username = req.username;
//     const votes = req.body.votes;
//
//     // validate that all questions submitted are part of the survey,
//     // and all choices are part of each question - otherwise get out
//
//     if (!(await validateVotes(req.body, survey_id))) {
//       let err = new Error(`The votes you submitted do not pass validation`);
//       err.status = 400;
//       throw err;
//     }
//
//     const votePromises = [];
//     for (const question of votes) {
//       const { question_id, vote_data } = question;
//       for (const vote of vote_data) {
//         const { choice_id, score } = vote;
//         votePromises.push(Vote.create({username, survey_id, question_id, choice_id, score}));
//       }
//     }
//
//     let results = await Promise.all(votePromises);
//     if (results.some(voteInstance => !(voteInstance instanceof Vote))) {
//       throw Error("Failed to record votes")
//     }
//
//     return res.json("Votes submitted");
//   } catch (error) {
//     return next(error);
//   }
// });


/** delete */

module.exports = router;
