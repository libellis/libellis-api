const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../../helpers/partialUpdate');
const Choice = require('../../Core/Domain/choice');

class ChoiceRepository {
  constructor(db) {
    this.db = db;
    this.commands = [];
  }

  /**
   *  READS
   */

  /**
   * get(id) -> return a choice by id (PK)
   *
   */
  get({ id }) {

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
  async getAll( question_id ) {

    let result = await this.db.query(`
          SELECT id, question_id, title, content, content_type
          FROM choices
          WHERE question_id = $1
      `,
      [question_id]
    );
    
    return result.rows.map(q => new Choice(q));
  }
  
  async getChoiceWithVoteTally(id) {
    let result = await this.db.query(`
      SELECT SUM(score) AS vote_tally,
             choices.id as id,
             choices.question_id as question_id,
             choices.title as title,
             choices.content as content,
             choices.content_type as content_type
      FROM votes
             JOIN choices ON votes.choice_id = choices.id
      WHERE choice_id=$1
      GROUP BY id
    `,
      [id]
    ); 
  }
  
  
  /**
   * getVoteTallyByQuestionId() ->
   * get's a the vote tally based on a question id
   * and returns that choices with their vote tallys.
   *
   */
  async getAllChoicesWithVoteTallys(question_id) {

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
  async add(choiceEntity) {
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
  async save(choiceEntity) {
    const {
      query,
      values
    } = sqlForPartialUpdate(
      'choices', {
        question_id: choiceEntity.question_id,
        title: choiceEntity.title,
        content: choiceEntity.content,
        content_type: choiceEntity.content_type
      },
      'id',
      choiceEntity.id
    );

    this.commands.push([query, values]);
  }

  async remove(choiceEntity) {
    this.commands.push([`
      DELETE FROM choices 
      WHERE id=$1
      RETURNING id
    `,
      [choiceEntity.id]]
    );
    
  }
}

module.exports = ChoiceRepository;
