const { BWF, SECRET, DEFAULT_PHOTO } = require('../config');

class User /* extends Model */ {
  constructor(username, password, first_name, last_name, email, photo_url, is_admin, db) {
    this.username = username;
    this.password = password
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

  set password(val) {
    const salt = bcrypt.genSaltSync(BWF);
    const hash = bcrypt.hashSync(password, salt),
    this._password = hash;
  }

  get password() {
    return this._password;
  }
}

module.exports = User;
