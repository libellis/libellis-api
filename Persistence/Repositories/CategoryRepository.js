const { Category } = require('../../Core/Domain/category');

class CategoryRepository {
  constructor(db) {
    this.db = db;
    this.commands = [];
  }
  /**
   * getAll() -> only use case is to return all Categories
   *
   */
  async getAll({ search }) {
    let result = await this.db.query(
      `
      SELECT title
      FROM categories 
      `
    );
    return result.rows.map(q => new Category(q));
  }

  /**
   * get(title) -> return a Category by title
   *
   */
  async get({ title }) {
    if (title === undefined) throw new Error(`Missing title parameter`);

    const result = await this.db.query(
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

    return new Category(result.rows[0]);
  }

  /**
   * @params {Object}  creates a new category for the
   * @returns   a new instance of Category class.
   *
   */
  async add(categoryEntity) {
    const { title } = categoryEntity;
    
    if (title === undefined) {
      const err = new Error(
        `Must supply title, content_type and question_title`
      );
      err.status = 400;
      throw err;
    }
    this.commands.push([
      `INSERT INTO Categories (title)
       VALUES ($1)
       RETURNING title
    `,
      [title]]
    );
  }

  //Delete Category and return a message
  async delete(categoryEntity) {
    this.commands.push([
      `
      DELETE FROM Categories 
      WHERE title=$1
      RETURNING title
    `,
      [this.title]]
    );
  }
}

module.exports = CategoryRepository;
