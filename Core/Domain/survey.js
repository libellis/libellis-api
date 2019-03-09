class Survey {
  constructor(id, author, title, description, category, date_posted, anonymous, published, questions) {
    this.id = id;
    this.author = author;
    this.title = title;
    this.description = description;
    this.category = category;
    this.date_posted = date_posted
    this.anonymous = anonymous;
    this.published = published;
    this.questions = questions;
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
}

module.exports = Survey;
