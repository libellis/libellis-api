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
}

module.exports = Vote;
