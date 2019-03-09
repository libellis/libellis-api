const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');
const Choice = require('../../Core/Domain/choice');

class ChoiceRepository {
  constructor(db) {
    this.db = db;
    this.commands = new Array();
  }

  /**
   *  READS
   */

  /**
   * get(id) -> return a choice by id
   *
   */
  static get({ id }) {

    if (id === undefined) throw new Error(`Missing id parameter`);

    const result = await this.db.query(`
      SELECT id, question_id, title, content, content_type
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
   * getAll() -> only use case is to return all choices by a question_id
   * so that's what this does
   *
   */
  static getAll({ question_id }) {

    let result = await this.db.query(`
          SELECT id, question_id, title, content, content_type
          FROM choices
          WHERE question_id = $1
      `,
      [question_id]
    );
    
    return result.rows.map(q => new Choice(q));
  }

  /**
   *  WRITES
   */

  /**
   * create(question_id, title, content) -> creates a new choice for the
   * given question and returns it as a new instance of Choice class.
   * 
   */
  static async add(choiceEntity) {
    const { questionId, content, title, contentType } = choiceEntity;
    
    this.commands.push([`
      INSERT INTO choices (question_id, title, content, content_type)
      VALUES ($1,$2,$3,$4)
      RETURNING id, question_id, title, content, content_type
    `,
      [questionId, title, content, contentType]]
    );
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
        content: this.content,
        content_type: this.content_type
      },
      'id',
      this.id
    );

    this.commands.push([query, values]);
  }

  async remove(choiceEntity) {
    const { id } = choiceEntity;
    
    this.commands.push([`
      DELETE FROM choices 
      WHERE id=$1
      RETURNING id
    `,
      [this.id]]
    );
    
  }
}

module.exports = Choice;
