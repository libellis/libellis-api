const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

const { User } = require('../../Core/Domain/user');

class UserRepository /* extends Model */ {
  constructor(db) {
    this.db = db;
    this.commands = [];
  }


  /** get User details - returns shallow user data */
  async get({ username }) {
    let result = await this.db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users 
      WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      const err = new Error(`Cannot find user by username: ${username}`);
      err.status = 400;
      throw err;
    }

    return new User(result.rows[0]);
  }

  // Get all users
  async getAll({ search }) {
    let result;
    if (search === undefined || search === '') {
      let result = await this.db.query(
        `SELECT username, first_name, last_name, email FROM users`
      );
    } else {
      let result = await this.db.query(
        `SELECT username, first_name, last_name, email FROM users
        WHERE username ILIKE $1`, [`%${search}%`]
      );
    }

    return result.rows.map(user => new User({ ...user, db }));
  }

  // Create a new user and return an instance
  async add(userEntity) {
    let result = await db.query(
      `
      INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, first_name, last_name, email, photo_url, is_admin`,
      [
        userEntity.username,
        userEntity.password,
        userEntity.first_name,
        userEntity.last_name,
        userEntity.email,
        userEntity.photo_url || DEFAULT_PHOTO,
        userEntity.is_admin || false
      ]
    );
    return new User(result.rows[0]);
  }

  // Authenticate user - returns JWT
  // async authenticate(, { username, password }) {
  //   const result = await db.query(`
  //     SELECT password, is_admin FROM users WHERE username=$1
  //   `, [username]
  //   );
  //   const user = result.rows[0];
  //   if (user) {
  //     if (bcrypt.compareSync(password, user.password)) {
  //       const token = jwt.sign({ username, is_admin: user.is_admin }, SECRET);
  //       return token;
  //     }
  //   }
  //   throw new Error('Invalid username/password')
  // }

  // /** get Surveys created by given user */
  // async getSurveys(, { username }) {
  //   let result = await db.query(
  //     `SELECT id, author, title, description, date_posted, anonymous, published
  //     FROM surveys WHERE author=$1`, [username]
  //   );

  //   if (result.rows.length === 0) return [];

  //   return result.rows.map(s => new Survey({ ...s, db }));
  // }

  // /** get Surveys user has voted on */
  // async getHistory(, { username }) {
  //   let result = await db.query(
  //     `SELECT 
  //       survey_id, 
  //       s.author AS author,
  //       s.title AS title,
  //       s.description AS description,
  //       s.date_posted AS date_posted,
  //       s.anonymous AS anonymous,
  //       s.published AS published
  //     FROM users_votes
  //     JOIN surveys AS s 
  //     ON users_votes.survey_id = s.id
  //     WHERE s.author = $1
  //     GROUP BY 
  //       survey_id,
  //       s.author, 
  //       s.title, 
  //       s.description, 
  //       s.anonymous, 
  //       s.published,
  //       s.date_posted;`,
  //     [username]
  //   );

  //   if (result.rows.length === 0) return [];

  //   return result.rows;
  // }

  // updateFromValues(vals) {
  //   classPartialUpdate(this, vals);
  // }

  // //Update a user instance
  // async save() {
  //   const { query, values } = sqlForPartialUpdate(
  //     'users',
  //     {
  //       username: this.username,
  //       first_name: this.first_name,
  //       last_name: this.last_name,
  //       email: this.email,
  //       photo_url: this.photo_url
  //     },
  //     'username',
  //     this.username
  //   );
  //   const result = await this.db.query(query, values);

  //   if (result.rows.length === 0) {
  //     const err = new Error('Cannot find user to update');
  //     err.status = 400;
  //     throw err;
  //   }
  // }

  // //Delete user and return a message
  // async delete() {
  //   const result = await this.db.query(
  //     `
  //   DELETE FROM users 
  //   WHERE username=$1
  //   RETURNING username`,
  //     [this.username]
  //   );

  //   if (result.rows.length === 0) {
  //     let err = new Error(`Could not find user to delete`)
  //     err.status = 400;
  //     throw err;
  //   }

  //   return 'User Deleted';
  // }
}

module.exports = User;
