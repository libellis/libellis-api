const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class Question {
  constructor({ id, survey_id, type, title }) {
    this.id = id;
    this.survey_id = survey_id;
    this.type = type;
    this.title = title;
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
   * getAll() -> return an array of question instances 
   *             whose title match search criteria, or whose
   *             survey_id or type match.  
   * 
   */
  static async getAll({ search, type }) {

    //If search, type or survey_id are undefined then they will be %%
    //helps fix bug if passed in object does not have all 3, or search
    //is intentionally empty to get all
    let result = await db.query(`
      SELECT id, survey_id, title, type
      FROM questions 
      WHERE (title ILIKE $1 and type ILIKE $2) 
      `,
      [
        `%${search === undefined ? '' : search}%`,
        `%${type === undefined ? '' : type}%`
      ]
    );

    return result.rows.map(q => new Question(q));
  }

  /**
   * get(id) -> return a question by id
   * 
   */
  static async get(id) {

    if (id === undefined) throw new Error('Missing id parameter');

    const result = await db.query(`
      SELECT id, survey_id, title, type
      FROM questions
      WHERE id=$1
      `, [id]
    );

    if (result.rows.length === 0) {
      const err = Error(`Cannot find question by id: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Question(result.rows[0]);
  }

  /**
   * create(survey_id, title, type) -> creates a new question for the
   * given survey and returns it as a new instance of Question class.
   * 
   */
  static async create({ survey_id, title, type }) {
    const result = await db.query(
      `
    INSERT INTO questions (survey_id, title, type)
    VALUES ($1,$2,$3)
    RETURNING id, survey_id, title, type
    `,
      [survey_id, title, type]
    );

    if (result.rows.length === 0) {
      throw new Error(`Can't create question`);
    }

    return new Question(result.rows[0]);
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
        type: this.type
      },
      'id',
      this.id
    );

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      const err = new Error('Cannot find question to update');
      err.status = 400;
      throw err;
    }
  }

  //Delete question and return a message
  async delete() {
    const result = await db.query(
      `
        DELETE FROM questions 
        WHERE id=$1
        RETURNING id`,
      [this.id]
    );

    if (result.rows.length === 0) {
      throw new Error(`Could not delete question: ${this.id}`);
    }
    return `Question Deleted`;
  }
}

module.exports = Question;
