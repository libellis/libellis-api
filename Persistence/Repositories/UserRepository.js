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

  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  //Update a user instance
  async save(userEntity) {
    const { query, values } = sqlForPartialUpdate(
      'users',
      {
        username: this.username,
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        photo_url: this.photo_url
      },
      'username',
      this.username
    );

    this.commands.push([query, values]);
  }

  //Delete user and return a message
  async remove(userEntity) {
    this.commands.push([
      `DELETE FROM users WHERE username=$1 RETURNING username`,
      [userEntity.username]
    ]);
  }
}

module.exports = User;
