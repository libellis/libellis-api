const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');


class Survey {
  constructor({ id, author, title, description, date_posted, anonymous, published}) {
    this.id = id;
    this.author = author;
    this.title = title;
    this.description = description;
    this.date_posted = date_posted
    this.anonymous = anonymous;
    this.published = published;
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

  /**
   * getSurvey(id) <- return a survey by id
   * 
   * @param {int} id
   */
  static async get(id) {

    if (id === undefined) throw new Error('Missing id parameter')

    let result = await db.query(
      `SELECT id, author, title, description, date_posted, anonymous, published
            FROM surveys
            WHERE id=$1`, [id]
    )

    if (result.rows.length < 1) {
      const err = Error('Not Found');
      err.status = 404;
      throw err;
    }

    return new Survey(result.rows[0]);
  }

  /**
   * getSurveys() <- return an array of surveys filtered by params
   * 
   * @param {{field: value, ...}} search
   */
  static async getAll(search) {
    let result;
    if (search === undefined || search === '') {
      result = await db.query(
        `SELECT id, author, title, description, date_posted, anonymous, published
        FROM surveys` 
      );
      console.log('search is empty', result.rows);
    } else {
      console.log('search is not empty');
      result = await db.query(
        `SELECT id, author, title, description, date_posted, anonymous, published
                FROM surveys WHERE 
                author ILIKE $1 OR
                title ILIKE $1 OR
                description ILIKE $1`, [`%${search}%`] 
      );
    }
    
    return result.rows.map(s => new Survey(s));
  }

  /**
   * createSurvey(author, title, description) <- returns created survey details
   * 
   * @param {Object}
   */
  static async create({ author, username, title, description }) {
    if (!author || !title) throw new Error('Missing author or title parameter');

    let result = await db.query(
      `INSERT INTO surveys (author, title, description)
            VALUES ($1, $2, $3)
            RETURNING id, author, title, description, date_posted, anonymous, published`,
      [author, title, description]
    )

    return new Survey(result.rows[0]);
  }

  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  //Update a user instance
  async save() {
    const {
      query,
      values
    } = sqlForPartialUpdate(
      'surveys', {
        description: this.description,
        title: this.title,
        anonymous: this.anonymous,
        published: this.published
      },
      'id',
      this.id
    );

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      const err = new Error('Cannot find survey to update');
      err.status = 400;
      throw err;
    }
  }

  //Delete user and return a message
  async delete() {
    const result = await db.query(
      `
        DELETE FROM surveys 
        WHERE id=$1
        RETURNING id`,
      [this.id]
    );
    if (result.rows.length === 0) {
      throw new Error(`Could not delete survey: ${this.id}`);
    }
    return `Deleted`;
  }
}

module.exports = Survey;
