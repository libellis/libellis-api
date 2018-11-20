const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate,
} = require('../helpers/partialUpdate');

class Vote {
  constructor({choice_id, survey_id, question_id, username, score}) {
    this.choice_id = choice_id;
    this.survey_id = survey_id;
    this.question_id = question_id;
    this.username = username;
    this.score = score;
  }

  // make setter/getter that makes it so you can't change primary key

  set choice_id(val) {
    if (this._choice_id) {
      throw new Error(`Can't change choice_id!`);
    }
    this._choice_id = val;
  }

  get choice_id() {
    return this._choice_id;
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

  set question_id(val) {
    if (this._question_id) {
      throw new Error(`Can't change question id!`);
    }
    this._question_id = val;
  }

  get question_id() {
    return this._question_id;
  }

  set username(val) {
    if (this._username) {
      throw new Error(`Can't change user id!`);
    }
    this._username = val;
  }

  get username() {
    return this._username;
  }

  /**
   * getAll() -> return all votes by a survey_id
   *
   */
  static async getAll({question_id}) {
    let result = await db.query(
      `
      SELECT SUM(score) AS votes, questions.title AS question_title, choices.title AS choice_title
      FROM questions
      JOIN votes ON questions.id = votes.question_id
      JOIN choices ON choices.id = votes.choice_id
      WHERE votes.question_id=$1
      GROUP BY choice_title, question_title
      ORDER BY votes DESC
      `,
      [question_id],
    );

    // we will need to return the votes as an array this time - can't create
    // vote instances since those would need choice_id, survey_id, question_id
    // and username to be defined.
    return result.rows;
  }

  /**
   * get(composite_key) -> return a vote by composite_key
   *
   */
  static async get({survey_id, username, question_id, choice_id}) {
    // put all desctructured params into an array. if any are empty string or
    // falsy value, throw error
    const voteData = [survey_id, username, question_id, choice_id];
    if (voteData.some(data => data === '' || !data)) {
      const err = new Error(
        'Must supply survey_id, username, question_id, choice_id, and score',
      );
      err.status = 400;
      throw err;
    }

    const result = await db.query(
      `
      SELECT choice_id, survey_id, username, question_id, score
      FROM votes
      WHERE (choice_id=$1 and survey_id=$2 and username=$3 and question_id=$4)
      `,
      [choice_id, survey_id, username, question_id],
    );

    if (result.rows.length === 0) {
      const err = Error(`Cannot find vote`);
      err.status = 404;
      throw err;
    }

    return new Vote(result.rows[0]);
  }

  /**
   * create(survey_id, username, question_id, choice_id, score) -> creates a new vote for the
   * given survey and returns it as a new instance of Vote class.
   *
   */
  static async create({survey_id, username, question_id, choice_id, score}) {
    // put all desctructured params into an array. if any are empty string or
    // falsy value, throw error
    const voteData = [survey_id, username, question_id, choice_id, score];
    if (voteData.some(data => data === '' || !data)) {
      const err = new Error(
        'Must supply survey_id, username, question_id, choice_id, and score',
      );
      err.status = 400;
      throw err;
    }

    const result = await db.query(
      `
      INSERT INTO votes (survey_id, username, question_id, choice_id, score)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING survey_id, username, question_id, choice_id, score
      `,
      [survey_id, username, question_id, choice_id, score],
    );

    if (result.rows.length === 0) {
      const err = new Error(`Can't create vote`);
      err.status = 400;
      throw err;
    }

    return new Vote(result.rows[0]);
  }

  // Remove vote and return a message
  // returning choice_id only for the reason
  // of verifying successful deletion
  async delete() {
    const result = await db.query(
      `
        DELETE FROM votes 
        WHERE (choice_id=$1 and survey_id=$2 and username=$3 and question_id=$4)
        RETURNING choice_id`,
      [this.choice_id, this.survey_id, this.username, this.question_id],
    );

    if (result.rows.length === 0) {
      throw new Error(`Could not delete vote`);
    }
    return `Vote Removed`;
  }
}

module.exports = Vote;
