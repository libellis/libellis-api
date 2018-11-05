const express = require('express');
const router = new express.Router();
const Survey = require('../models/survey');
const User = require('../models/user');

const createSurveySchema = require('../schema/createSurvey.json')
const validateInput = require('../middleware/validation');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');


/** get a list of surveys */
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

/** get a survey by id */
router.get('/:id', async function (req, res, next) {
  try {
    const survey = await Survey.get(req.params.id);
    return res.json({survey})
  } catch (err) {
    return next(err);
  }
});

/**  create a new survey */
router.post('/', ensureLoggedIn, validateInput(createSurveySchema), async function (req, res, next) {
  try {
    let { title, description } = req.body
    const survey = await Survey.create({username: req.username, title, description });
    return res.json({
      survey
    });
  } catch (error) {
    return next(error);
  }
});

/** update a survey */
router.patch('/:id', ensureCorrectUser, async function(req, res, next) {

});

module.exports = router;