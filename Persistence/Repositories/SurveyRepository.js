const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');
const { Survey } = require('../../Core/Domain/survey');
const { Question } = require('../../Core/Domain/question');
const { Choice } = require('../../Core/Domain/choice');

class SurveyRepository {
  constructor(db) {
    this.db = db;
    this.commands = [];
  }

  /**
   * get({ id }) <- return a survey by id
   * 
   * @param {int} id
   */
  async get({ id }) {
    if (id === undefined) throw new Error('Missing id parameter')

    let result = await this.db.query(
      `SELECT id,
              author,
              title,
              description,
              category,
              date_posted,
              anonymous,
              published
       FROM surveys
       WHERE id = $1`, [id]
    );

    if (result.rows.length < 1) {
      const err = Error('Not Found');
      err.status = 404;
      throw err;
    }

    return new Survey(result.rows[0]);
  }

  /**
   * getAll() <- return an array of surveys filtered by params
   * 
   * @param {{field: value, ...}} search
   */

  // Question - does the fact that search is a string mean we
  // should do object destructuring for all getAll input types?
  async getAll({ search }) {
    let result;
    if (search === undefined || search === '') {
      result = await this.db.query(
        `SELECT id,
                author,
                title,
                description,
                category,
                date_posted,
                anonymous,
                published
         FROM surveys
         WHERE published = true`
      );
    } else {
      result = await this.db.query(
        `SELECT id,
                author,
                title,
                description,
                category,
                date_posted,
                anonymous,
                published
         FROM surveys
         WHERE author ILIKE $1
            OR title ILIKE $1
            OR description ILIKE $1`, [`%${search}%`]
      );
    }

    return result.rows.map(s => new Survey(s));
  }

  async getSurveyWithQuestions(id) {
    const survey = await this.get({ id });

    let questionsResult = await db.query(`
          SELECT id, survey_id, title, question_type
          FROM questions
          WHERE survey_id=$1
      `,
      [id]
    );

    survey.questions = questionsResult.rows.map(q => new Question(q));

    return survey;
  }

  /**
   * getQuestionWithChoicesVoteTallys() ->
   * get's a the vote tally based on a question id
   * and returns that aggregate data appropriately.
   */
  async getSurveyWithQuestionsChoicesAndVoteTallys(id) {
    let surveys = this.getSurveyWithQuestions(id);

    const result = await this.db.query(`
      SELECT SUM(score) AS vote_tally,
             choices.id as id, 
             choices.question_id as question_id, 
             choices.title as title, 
             choices.content as content, 
             choices.content_type as content_type
      FROM votes 
      JOIN choices ON votes.choice_id = choices.id
      JOIN questions ON choices.question_id = questions.id
      WHERE questions.survey_id=$1
      GROUP BY choices.id
      `,
      [id]
    );

    const choices = result.rows.map(q => new Choice(q));
    question.choices = choices;

    return question;
  }

  /** get surveys by user is handled by User model, so this is commented out */

  // static async getForUser(username) {
  //   let result = await db.query(
  //     `SELECT id, author, title, description, date_posted, anonymous, published
  //     FROM surveys WHERE author = $1`, [username]
  //   );
  //   return result.rows.map(s => new Survey(s));
  // }


  /**
   * createSurvey(author, title, description) <- returns created survey details
   * 
   * @param {Object}
   */
  async add(surveyEntity) {
    const { author, username, title, description, category } = surveyEntity;

    if (!author || !title) throw new Error('Missing author or title parameter');

    this.commands.push([
      `INSERT INTO surveys (author, title, description, category)
       VALUES ($1, $2, $3, $4) RETURNING id, author, title, description, category, date_posted, anonymous, published`,
      [author, title, description, category]]
    )
  }

  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  // Update a user instance
  async save(surveyEntity) {
    const {
      query,
      values
    } = sqlForPartialUpdate(
      'surveys', {
        description: surveyEntity.description,
        title: surveyEntity.title,
        anonymous: surveyEntity.anonymous,
        published: surveyEntity.published,
        category: surveyEntity.category,
      },
      'id',
      surveyEntity.id
    );

    this.commands.push([query, values]);
  }

  // Delete user and return a message
  async remove(surveyEntity) {
    this.commands.push([
      `DELETE
       FROM surveys
       WHERE id = $1 RETURNING id`,
      [surveyEntity.id]]
    );
  }
}

module.exports = SurveyRepository;
