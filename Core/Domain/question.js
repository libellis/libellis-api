class Question {
  constructor( id, survey_id, question_type, title, choices ) {
    this.id = id;
    this.survey_id = survey_id;
    this.question_type = question_type;
    this.title = title;
    this.choices = choices;
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

  set survey_id(val) {
    if (this._survey_id) {
      throw new Error(`Can't change survey id!`);
    }
    this._survey_id = val;
  }

  get survey_id() {
    return this._survey_id;
  }
}

module.exports = Question;
