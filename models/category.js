const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class Category {
  constructor({ title, db }) {
    this.title = title;
    this.db = db;
  }

  // make setter/getter that makes it so you can't change primary key

  set title(val) {
    if (this._title) {
      throw new Error(`Can't change title!`);
    }
    this._title = val;
  }

  get title() {
    return this._title;
  }

  /**
   * getAll() -> only use case is to return all Categories
   *
   */
  static async getAll({ db }, { search }) {
    let result = await db.query(
      `
      SELECT title
      FROM categories 
      `
    );
    return result.rows.map(q => new Category({ ...q, db }));
  }

  /**
   * get(title) -> return a Category by title
   *
   */
  static async get({ db }, { title }) {
    if (title === undefined) throw new Error(`Missing title parameter`);

    const result = await db.query(
      `
      SELECT title
      FROM categories
      WHERE title=$1
      `,
      [title]
    );

    if (result.rows.length === 0) {
      const err = Error(`Cannot find Category by title: ${title}`);
      err.status = 404;
      throw err;
    }

    return new Category({ ...result.rows[0], db });
  }

  /**
   * @params {Object}  creates a new category for the
   * @returns   a new instance of Category class.
   *
   */
  static async create({ db }, { title }) {
    if (title === undefined) {
      const err = new Error(
        `Must supply title, content_type and question_title`
      );
      err.status = 400;
      throw err;
    }
    const result = await db.query(
      `
      INSERT INTO Categories (title)
      VALUES ($1)
      RETURNING title
    `,
      [title]
    );

    return new Category({ ...result.rows[0], db});
  }

  //Delete Category and return a message
  async delete() {
    const result = await this.db.query(
      `
      DELETE FROM Categories 
      WHERE title=$1
      RETURNING title
    `,
      [this.title]
    );

    return `${result.rows[0]} Category Deleted`;
  }
}

module.exports = Category;
