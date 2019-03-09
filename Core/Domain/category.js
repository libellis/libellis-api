class Category {
  constructor( title ) {
    this.title = title;
  }

  // make setter/getter that makes it so you can't change primary key
  set title(val) {
    if (this._title) {
      throw new Error(`Can't change title!`);
    }
    this._title = val;
  }

  get title() {
    return this._title;
  }
}

module.exports = Category;
