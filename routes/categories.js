const express = require('express');
const router = new express.Router();
// const Category = require('../models/category');
//
// // const createSurveySchema = require('../schema/createSurvey.json');
// // const validateInput = require('../middleware/validation');
// const { ensureLoggedIn, ensureAdminUser } = require('../middleware/auth');
//
// /** get a list of categories
//  *
//  */
// router.get('/', async function(req, res, next) {
//   try {
//     const categories = await Category.getAll();
//     return res.json({
//       categories
//     });
//   } catch (error) {
//     return next(error);
//   }
// });
//
// /** get a category by id
//  *
//  */
// router.get('/:title', async function(req, res, next) {
//   try {
//     const category = await Category.get(req.params.title);
//     return res.json({ category });
//   } catch (err) {
//     return next(err);
//   }
// });
//
// /** create a new category
//  *
//  */
// router.post('/', ensureLoggedIn, ensureAdminUser, async function(
//   req,
//   res,
//   next
// ) {
//   try {
//     let { title } = req.body;
//     const category = await Category.create({
//       title
//     });
//     return res.json({
//       category
//     });
//   } catch (error) {
//     return next(error);
//   }
// });
//
// /** delete a survey
//  *
//  * responds with message
//  */
// router.delete('/:id', ensureLoggedIn, ensureAdminUser, async function(
//   req,
//   res,
//   next
// ) {
//   try {
//     let category = await Category.get(req.params.title);
//     await category.delete();
//     return res.json('Deleted');
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
