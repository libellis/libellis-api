const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class Choice {
  constructor({ id, question_id, content, title }) {
    this.id = id;
    this.question_id = question_id;
    this.content = content;
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

  set question_id(val) {
    if (this._question_id) {
      throw new Error(`Can't change question id!`);
    }
    this._question_id = val;
  }

  get question_id() {
    return this._question_id;
  }

  /**
   * getAll() -> only use case is to return all choices by a question_id
   * so that's what this does
   * 
   */
  static async getAll({ question_id }) {

    let result = await db.query(`
      SELECT id, question_id, title, content
      FROM choices 
      WHERE question_id=$1
      `,
      [question_id]
    );

    return result.rows.map(q => new Choice(q));
  }

  /**
   * get(id) -> return a choice by id
   * 
   */
  static async get(id) {

    if (id === undefined) throw new Error(`Missing id parameter`);

    const result = await db.query(`
      SELECT id, question_id, title, content
      FROM choices
      WHERE id=$1
      `, [id]
    );

    if (result.rows.length === 0) {
      const err = Error(`Cannot find choice by id: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Choice(result.rows[0]);
  }

  /**
   * create(question_id, title, content) -> creates a new choice for the
   * given question and returns it as a new instance of Choice class.
   * 
   */
  static async create({ question_id, title, content }) {
    const result = await db.query(`
      INSERT INTO choices (question_id, title, content)
      VALUES ($1,$2,$3)
      RETURNING id, question_id, title, content
    `,
      [question_id, title, content]
    );

    if (result.rows.length === 0) {
      const err = new Error(`Can't create choice`);
      err.status = 400;
      throw err;
    }

    return new Choice(result.rows[0]);
  }

  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  //Update a choice instance
  async save() {
    const {
      query,
      values
    } = sqlForPartialUpdate(
      'choices', {
        question_id: this.question_id,
        title: this.title,
        content: this.content
      },
      'id',
      this.id
    );

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      const err = new Error(`Cannot find choice to update`);
      err.status = 400;
      throw err;
    }
  }

  //Delete choice and return a message
  async delete() {
    const result = await db.query(`
      DELETE FROM choices 
      WHERE id=$1
      RETURNING id
    `,
      [this.id]
    );

    if (result.rows.length === 0) {
      throw new Error(`Could not delete choice: ${this.id}`);
    }
    return `Choice Deleted`;
  }
}

module.exports = Choice;
