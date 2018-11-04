const express = require('express');
const router = new express.Router();
const Survey = require('../models/survey');
const User = require('../models/user');
const validateInput = require('../middleware/validation');

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
    const survey = await Survey.get(req.params.id);
    return res.json({survey})
  } catch (err) {
    return next(err);
  }
});

//Create a new user
router.post('/', async function (req, res, next) {
  try {
    const survey = await Survey.create(req.body);
    return res.json({
      survey
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;