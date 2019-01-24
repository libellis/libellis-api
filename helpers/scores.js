const Question = require('../models/question');
const Choice = require('../models/choice');

/**
 * 
 * @param {{
        _token: userToken,
        votes: [
          {question_id: question1.id,
            vote_data: [
            {choice_id: choice1.id}
          ]},
          {question_id: question2.id,
            vote_data: [
            {choice_id: choice5.id},
            {choice_id: choice6.id},
            {choice_id: choice7.id},
            {choice_id: choice8.id},
          ]}} data => input
 */

async function validateVotes(data, survey_id) {
  const questions_data = data.votes;
  for (const questionObj of questions_data) {
    const surveyQuestions = await Question.getAll({survey_id});
    if (!_isQuestionInSurvey(surveyQuestions, questionObj.question_id)) return false;
    if (surveyQuestions.find(obj => obj._id === questionObj.question_id).question_type === "ranked") {
      attachScoresRanked(questionObj.vote_data);
    } else {
      if (_multipleChoiceHasOnlyOne(questionObj.vote_data)) {
        questionObj.vote_data[0].score = 1;
      } else {
        return false;
      }
    }
    for (const votes of questionObj.vote_data) {
      const questionChoices = await Choice.getAll({question_id: questionObj.question_id});
      if (!_isChoiceInQuestion(questionChoices, votes.choice_id)) return false;
    }
  }
  return true;
}

function attachScoresRanked(voteData) {
  let topScore = voteData.length;

  for (let choice in voteData) {
    choice.score = topScore; 
    topScore--;
  }
}

function _multipleChoiceHasOnlyOne(voteData) {
  return (voteData.length === 1);
}

function _isQuestionInSurvey(surveyQuestions, question_id) {
  return (surveyQuestions.findIndex(q => q._id === question_id) !== -1);
}

function _isChoiceInQuestion(questionChoices, choice_id) {
  return (questionChoices.findIndex(c => c._id === choice_id) !== -1);
}

module.exports = {
  validateVotes,
};
