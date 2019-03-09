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
  const { choices } = data;
  const question = await Question.create(data);

  question.choices = [];
  for (let choice of choices) {
    let result = await insertQuestion({ question_id: question._id, ...choice });
    question.choices.push(result);
  }

  return question
}

/*
 * Insert a survey using a JSON data
 */
async function insertSurvey(data) {
  const { author, title, description, category, questions } = data;

  const survey = await Survey.create(data)
  survey.questions = [];
  for (const q of questions) {
    const result = await insertQuestion({ survey_id: survey._id, ...q });
    survey.questions.push(result);
  }

  // survey.questions = await questions.map(async q =>
  //   await insertQuestion({ survey_id: survey._id, ...q })
  // );
  return survey;
}

module.exports = surveyFactory;
