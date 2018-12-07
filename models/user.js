const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const { BWF, SECRET, DEFAULT_PHOTO } = require('../config');
const jwt = require('jsonwebtoken');
const Survey = require('../models/survey');


class User /* extends Model */ {
  constructor({ username, first_name, last_name, email, photo_url, is_admin }) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    this.is_admin = is_admin;
  }

  // make setter/getter that makes it so you can't change primary key

  set username(val) {
    if (this._username) {
      throw new Error(`Can't change username!`);
    }
    this._username = val;
  }

  get username() {
    return this._username;
  }

  //Get a filtered list of users and return array of instances
  static async getUsers() {
    //If search is undefined then search will be %%
    let result = await db.query(
      `
    SELECT username, first_name, last_name, email
    FROM users`
    );

    return result.rows.map(user => new User(user));
  }

  //Create a new user and return an instance
  static async createUser({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin
  }) {
    let result = await db.query(
      `
    INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING username, first_name, last_name, email, photo_url, is_admin`,
      [
        username,
        await bcrypt.hash(password, BWF),
        first_name,
        last_name,
        email,
        photo_url || DEFAULT_PHOTO,
        is_admin || false
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Cannot create user');
    }

    return new User(result.rows[0]);
  }

  // Authenticate user - returns JWT
  static async authenticate({ username, password }) {
    const result = await db.query(`
      SELECT password, is_admin FROM users WHERE username=$1
    `, [username]
    );
    const user = result.rows[0];
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username, is_admin: user.is_admin }, SECRET);
        return token;
      }
    }
    throw new Error('Invalid username/password')
  }

  /** get User details - returns shallow user data */
  static async getUser(username) {
    let result = await db.query(
      `
    SELECT username, first_name, last_name, email, photo_url
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

  /** get Surveys created by given user */
  static async getSurveys(username) {
    let result = await db.query(
      `SELECT id, author, title, description, date_posted, anonymous, published
      FROM surveys WHERE author=$1`, [username]
    );

    if (result.rows.length === 0) return [];

    return result.rows.map(s => new Survey(s));
  }

  /** get Surveys user has voted on */
  static async getHistory(username) {
    let result = await db.query(
      `SELECT 
        survey_id, 
        s.author AS author,
        s.title AS title,
        s.description AS description,
        s.date_posted AS date_posted,
        s.anonymous AS anonymous,
        s.published AS published
      FROM users_votes
      JOIN surveys AS s 
      ON users_votes.survey_id = s.id
      WHERE s.author = $1
      GROUP BY 
        survey_id,
        s.author, 
        s.title, 
        s.description, 
        s.anonymous, 
        s.published,
        s.date_posted;`, 
      [username]
    );
    
    if (result.rows.length === 0) return [];

    return result.rows;
  }

  updateFromValues(vals) {
    classPartialUpdate(this, vals);
  }

  //Update a user instance
  async save() {
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
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      const err = new Error('Cannot find user to update');
      err.status = 400;
      throw err;
    }
  }

  //Delete user and return a message
  async deleteUser() {
    const result = await db.query(
      `
    DELETE FROM users 
    WHERE username=$1
    RETURNING username`,
      [this.username]
    );
    if (result.rows.length === 0) {
      throw new Error(`Could not delete user: ${this.username}`);
    }
    return 'User Deleted';
  }
}

module.exports = User;
