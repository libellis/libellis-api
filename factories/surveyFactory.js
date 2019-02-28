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
async function insertChoice(qid, data) {
  const { content, title, ctype } = data;
  let choiceResult = await db.query(
    `
    INSERT INTO choices (question_id, content, title, content_type)
    VALUES ($1, $2, $3, $4)
    RETURNING id, question_id, content, title, content_type
    `,
    [qid, content, title, ctype]
  );
  const choice = choiceResult.rows[0];
  return choice;
}

/**
 * Insert a question for a given survey id and JSON data
 */
async function insertQuestion(survey_id, data) {
  const { title, qtype } = data;

  let questionResult = await db.query(
    `
    INSERT INTO questions (title, question_type, survey_id)
    VALUES ($1, $2, $3)
    RETURNING id, title, question_type, survey_id
  `,
    [title, qtype, survey1.id]
  );

  const question = questionResult.rows[0];
  question.chocies = question.choices.map(c => await insertChoice(c));
  return question
}

/*
 * Insert a survey using a JSON data
 */
async function insertSurvey(data) {
  const { author, title, description, category, questions } = data;

  let surveyResult = await db.query(`
    INSERT INTO surveys (author, title, description, category)
    VALUES ('${author}', '${title}', '${description}', '${category1}')
    RETURNING id, author, title, description, anonymous, date_posted, category
  `);

  const survey = result3.rows[0];

  survey.questions = survey.questions.map(q => await insertQuestion(survey._id));

  return survey;
}

module.exports = surveyFactory;
