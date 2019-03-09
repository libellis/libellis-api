const {
  sqlForPartialUpdate,
  classPartialUpdate,
} = require('../helpers/partialUpdate');

class Vote {
  constructor(choice_id, username, score) {
    this.choice_id = choice_id;
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
   * getAll() -> return all votes by a question_id
   *
   */
  static async getAll({ db }, { question_id }) {

    let result = await db.query(`
    SELECT 
    SUM(score) AS votes, 
    questions.title AS question_title, 
    choices.title AS choice_title from votes
    JOIN choices ON votes.choice_id = choices.id
    JOIN questions ON choices.question_id = questions.id
    WHERE questions.id = $1
    GROUP BY choice_title, question_title
    ORDER BY votes DESC
    `, [question_id]);

    // we will need to return the votes as an array this time - can't create
    // vote instances since those would need choice_id, survey_id, question_id
    // and username to be defined.
    return result.rows;
  }

  /**
   * get(composite_key) -> return a vote by username and choice_id
   *
   */
  static async get({ db }, { username, choice_id }) {
    const voteData = [username, , choice_id];
    if (voteData.some(data => data === '' || !data)) {
      const err = new Error(
        'Missing parameters',
      );
      err.status = 400;
      throw err;
    }

    const result = await db.query(
      `
      SELECT choice_id, username, score
      FROM votes
      WHERE (choice_id=$1 and username=$2)
      `,
      [choice_id, username],
    );

    if (result.rows.length === 0) {
      const err = Error(`Cannot find vote`);
      err.status = 404;
      throw err;
    }

    return new Vote({ ...result.rows[0], db });
  }

  /**
   * create(username, choice_id, score) -> creates a new vote for the
   * given survey and returns it as a new instance of Vote class.
   */
  static async create({ db }, { username, choice_id, score }) {
    const voteData = [username, choice_id, score];

    if (voteData.some(data => !data)) {
      const err = new Error(
        'Missing parameters',
      );
      err.status = 400;
      throw err;
    }

    const result = await db.query(
      `
      INSERT INTO votes (username, choice_id, score)
      VALUES ($1, $2, $3)
      RETURNING username, choice_id, score
      `,
      [username, choice_id, score],
    );

    return new Vote({ ...result.rows[0], db });
  }

  // Remove vote and return a message
  // returning choice_id only for the reason
  // of verifying successful deletion
  async delete() {
    const result = await this.db.query(
      `
        DELETE FROM votes 
        WHERE (choice_id=$1 and username=$2)
        RETURNING choice_id`,
      [this.choice_id, this.username],
    );

    if (result.rows.length === 0) {
      throw new Error(`Could not delete vote`);
    }
    return `Vote Removed`;
  }
}

module.exports = Vote;
