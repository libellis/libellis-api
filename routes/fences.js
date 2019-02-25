const express = require('express');
const router = new express.Router();
const Fence = require('../models/fence');
const Question = require('../models/question');

const validateInput = require('../middleware/validation');
const { ensureLoggedIn, ensureAuthor } = require('../middleware/auth');


/** get a list of fences
 * accepts a query param of "search" to filter results
 *
 * responds with a an array of fences with top level data
 */
router.get('/', async function (req, res, next) {
  try {
    let { search } = req.query;
    const fences = await Fence.getAll(search);
    return res.json({
      fences
    });
  } catch (error) {
    return next(error);
  }
});


router.get('/geo', async function (req, res, next) {
 try {
   let { lon, lat } = req.query;
   const fences = await Fence.getFenceByCoords({type: "Point", coordinates:[lon,lat]});

   return res.json({
     fences
   });
 } catch (error) {
   return next(error);
 }
});

/** get a fence by id
 *
 * responds with a fence object with top level data
 * with an array of questions with top level data
*/
router.get('/:id', async function (req, res, next) {
  try {
    const fence = await Fence.get(req.params.id);
    fence.questions = await Question.getAll({ fence_id: fence.id });
    return res.json({fence})
  } catch (err) {
    return next(err);
  }
});

/** delete a fence
 *
 * responds with message
*/
router.delete('/:id', ensureLoggedIn, ensureAuthor, async function(req, res, next) {
  try {
    let fence = req.fence;
    await fence.delete();
    return res.json('Deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
