class Choice {
  constructor({ id, question_id, content, title, content_type, vote_tally = null }) {
    this.id = id;
    this.questionId = question_id;
    this.content = content;
    this.title = title;
    this.contentType = content_type;
    this.voteTally = vote_tally;
  }

  // make setter/getter that makes it so you can't change primary key
  set id(val) {
    if (this._id) {
      throw new Error(`Can't change id!`);
    }
    this._id = val;
  }

  get id() {
    return this._id;
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
}

module.exports = Choice;