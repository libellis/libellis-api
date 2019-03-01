const Category = require('../models/category');

/*
 * Create a category in database
 */
async function categoryFactory({ category }) {
  return await Category.create({ title: category });
}

module.exports = categoryFactory;