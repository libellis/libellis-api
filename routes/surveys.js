const express = require('express');
const router = new express.Router();
const Survey = require('../models/survey');
const User = require('../models/user');
const {
  ensureLoggedIn,
  ensureCorrectUser
} = require('../middleware/auth');


// Get a list of surveys
router.get('/', async function (req, res, next) {
  try {
    const surveys = await Survey.getAll();
    return res.json({
      surveys
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    console.log(req.params.id)
    const survey = await Survey.get(req.params.id);
    return res.json(survey)

  } catch (err) {
    return next(error);
  }
});

//Create a new user
// router.post('/', validateInput(newUserSchema), async function (req, res, next) {
//   try {
//     await User.createUser(req.body);
//     const token = await User.authenticate(req.body);
//     return res.json({
//       token
//     });
//   } catch (error) {
//     return next(error);
//   }
// });

module.exports = router;