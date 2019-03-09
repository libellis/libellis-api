const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class Question {
  constructor({ id, survey_id, question_type, title, db }) {
    this.id = id;
    this.survey_id = survey_id;
    this.question_type = question_type;
    this.title = title;
    this.db = db
  }

  // make setter/getter that makes it so you can't change primary key

  set id(val) {
    if (this._id) {
      throw new Error(`Can't change id!`);
    }
    this._id = val;
  }

  get id() {
    return this._id;
  }

  set survey_id(val) {
    if (this._survey_id) {
      throw new Error(`Can't change survey id!`);
    }
    this._survey_id = val;
  }

  get survey_id() {
    return this._survey_id;
  }

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
  static async get({ db }, { id }) {

    if (id === undefined) throw new Error('Missing id parameter');

    const result = await db.query(`
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

    return new Question({ ...result.rows[0], db });
  }

  /**
   * create(survey_id, title, question_type) -> creates a new question for the
   * given survey and returns it as a new instance of Question class.
   * 
   */
  static async create({ db }, { survey_id, title, question_type }) {
    if (survey_id === undefined || title === undefined ||
        question_type === undefined) {
      const err = new Error(`Must supply title, question_type and survey_id`);
      err.status = 400;
      throw err;
    }
    const result = await db.query(
      `
    INSERT INTO questions (survey_id, title, question_type)
    VALUES ($1,$2,$3)
    RETURNING id, survey_id, title, question_type
    `,
      [survey_id, title, question_type]
    );

    return new Question({ ...result.rows[0], db });
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
}

module.exports = Question;
