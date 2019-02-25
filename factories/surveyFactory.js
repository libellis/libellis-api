/*
 * Create survey in database and return the new survey object
 */
async function insertSurvey(data) {
  const { author, title, description, category, questions } = data;

  let surveyResult = await db.query(`
    INSERT INTO surveys (author, title, description, category)
    VALUES ('${author}', '${title}', '${description}', '${category1}')
    RETURNING id, author, title, description, anonymous, date_posted, category
  `);

  const survey = result3.rows[0];
  return survey;
}

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
  return survey;
}
