const {
  sqlForPartialUpdate,
} = require('../../helpers/partialUpdate');

const User = require('../../Core/Domain/user');
const { DEFAULT_PHOTO } = require("../../config");

class UserRepository {
  constructor(db) {
    this.db = db;
    this.commands = [];
  }

  /** READS */

  /** get User details - returns shallow user data */
  async get({ username }) {
    let result = await this.db.query(
      `SELECT username, password, first_name, last_name, email, photo_url, is_admin
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
      result = await this.db.query(
        `SELECT username, first_name, last_name, email FROM users`
      );
    } else {
      result = await this.db.query(
        `SELECT username, first_name, last_name, email FROM users
        WHERE username ILIKE $1`, [`%${search}%`]
      );
    }

    return result.rows.map(user => new User(user));
  }

  /** WRITES */

  // Create a new user and return an instance
  add(userEntity) {
    this.commands.push([`
      INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, first_name, last_name, email, photo_url, is_admin`,
      [
        userEntity.username,
        userEntity.hashedPassword,
        userEntity.first_name,
        userEntity.last_name,
        userEntity.email,
        userEntity.photo_url || DEFAULT_PHOTO,
        userEntity.is_admin || false
      ]]
    );
  }

  //Update a user instance
  save(userEntity) {
    const { query, values } = sqlForPartialUpdate(
      'users',
      {
        username: userEntity.username,
        password: userEntity.password,
        first_name: userEntity.first_name,
        last_name: userEntity.last_name,
        email: userEntity.email,
        photo_url: userEntity.photo_url
      },
      'username',
      userEntity.username
    );

    this.commands.push([query, values]);
  }

  //Delete user and return a message
  remove(userEntity) {
    this.commands.push([
      `DELETE FROM users WHERE username=$1 RETURNING username`,
      [userEntity.username]
    ]);
  }
}

module.exports = UserRepository;
