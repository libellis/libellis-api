const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class QuestionRepository {
  constructor(db) {
    this.db = db;
    this.commands = [];
  }

  /**
   *  READS
   */

  /**
   * getAll() -> only use case is to return all questions by a survey_id
   * so that's what this does
   * 
   */
  static async getAll({ db }, { survey_id }) {

    //If search, type or survey_id are undefined then they will be %%
    //helps fix bug if passed in object does not have all 3, or search
    //is intentionally empty to get all
    let result = await db.query(`
      SELECT id, survey_id, title, question_type
      FROM questions 
      WHERE survey_id=$1
      `,
      [survey_id]
    );

    return result.rows.map(q => new Question({ ...q, db }));
  }

  /**
   * get(id) -> return a question by id
   * 
   */
  async get({ id }) {

    if (id === undefined) throw new Error('Missing id parameter');

    const result = await this.db.query(`
      SELECT id, survey_id, title, question_type
      FROM questions
      WHERE id=$1
      `, [id]
    );

    if (result.rows.length === 0) {
      const err = Error(`Cannot find question by id: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Question( result.rows[0] );
  }
  
  /**
   *  WRITES
   */

  /**
   * create(survey_id, title, question_type) -> creates a new question for the
   * given survey and returns it as a new instance of Question class.
   * 
   */
  async add(questionEntity) {
    const { survey_id, title, question_type } =  questionEntity;
    
    if (survey_id === undefined || title === undefined ||
        question_type === undefined) {
      const err = new Error(`Must supply title, question_type and survey_id`);
      err.status = 400;
      throw err;
    }
    
    this.commands.push([
      `INSERT INTO questions (survey_id, title, question_type)
       VALUES ($1, $2, $3) RETURNING id, survey_id, title, question_type`,
      [survey_id, title, question_type]]
    );
  }

  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  //Update a question instance
  async save() {
    const {
      query,
      values
    } = sqlForPartialUpdate(
      'questions', {
        survey_id: this.survey_id,
        title: this.title,
        question_type: this.question_type
      },
      'id',
      this.id
    );

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      const err = new Error(`Cannot find question to update`);
      err.status = 400;
      throw err;
    }
  }

  //Delete question and return a message
  async delete() {
    const result = await this.db.query(
      `
        DELETE FROM questions 
        WHERE id=$1
        RETURNING id`,
      [this.id]
    );

    // Update to return boolean
    return `Question Deleted`;
  }

  /** 
   * Extra custom rep methods
   */

  /**
   * getVoteTallyByQuestionId() ->
   * get's a the vote tally based on a question id
   * and returns that aggregate data appropriately.
   *
   */
  static async getVoteTallyByQuestionId(question_id) {

    let result = await this.db.query(`
      SELECT SUM(score) AS vote_tally,
             choices.id as id, 
             choices.question_id as question_id, 
             choices.title as title, 
             choices.content as content, 
             choices.content_type as content_type
      FROM votes 
      JOIN choices ON votes.choice_id = choices.id
      WHERE question_id=$1
      GROUP BY id
      `,
      [question_id]
    );

    return result.rows.map(q => new Choice({ ...q, db}));
  }

}

module.exports = QuestionRepository;
