const db = require('../db');
const Survey = require('../models/survey');
const Question = require('../models/question');
const Choice = require('../models/choice');

/*
 * Create survey in database and return the new survey object
 */
async function surveyFactory(data) {
  const survey = await insertSurvey(data);
  return survey;
}

/**
 * Insert a choice for a given question id and JSON data
 */
async function insertChoice(data) {
  const { question_id, content, title, content_type } = data;
  const choice = await Choice.create(data)
  return choice;
}

/**
 * Insert a question for a given survey id and JSON data
 */
async function insertQuestion(data) {
  const question = await Question.create(data);

  // question.choices = await data.choices.map(async c => 
  //   await insertChoice({ question_id: question.id, ...c })
  // );

  /** 
   * Foreign key constraint error that must be investigated,
   * return empty array for now
   */
  question.choices = []
  return question
}

/*
 * Insert a survey using a JSON data
 */
async function insertSurvey(data) {
  const { author, title, description, category, questions } = data;

  const survey = await Survey.create(data)
  survey.questions = await questions.map(async q =>
    await insertQuestion({ survey_id: survey._id, ...q })
  );

  return survey;
}

module.exports = surveyFactory;
