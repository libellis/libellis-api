const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const Survey = require('../models/survey');
// const Question = require('../models/question');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');
const newUserSchema = require('../schema/newUser.json');
const updateUserSchema = require('../schema/updateUser.json');
const { ensureAdminUser, ensureLoggedIn, ensureCorrectUserOrAdmin } = require('../middleware/auth');

/** 
 * users endpoints are restricted
 * users can only make requests concerning their own profile
 * only admin users can make a GET request for all users   
 */

// Get a list of users, admin only
router.get('/', ensureAdminUser, async function (req, res, next) {
  const users = await User.getAll();
  return res.json({ users });
});

// Create/Register a new user
router.post('/', validateInput(newUserSchema), async function (req, res, next) {
  try {
    await User.create(req.body);
    const token = await User.authenticate(req.body);
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

// Get a user by username
router.get('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    // user.surveys = await User.getSurveys(req.params.username);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

// Get a list of surveys created by this user
router.get('/:username/surveys', ensureCorrectUserOrAdmin, async function (req, res, next) {
  const surveys = await User.getSurveys(req.params.username);
  return res.json({ surveys });
});

// Get a list of surveys voted on by this user, 
router.get('/:username/history', ensureCorrectUserOrAdmin, async function (req, res, next) {
  const surveys = await User.getHistory(req.params.username);
  return res.json({ surveys });
});

//Update a user
router.patch(
  '/:username',
  ensureCorrectUserOrAdmin,
  validateInput(updateUserSchema),
  async function (req, res, next) {
    try {
      let user = await User.get(req.params.username);
      user.updateFromValues(req.body);
      await user.save();
      return res.json({ user });
    } catch (error) {
      return next(error);
    }
  }
);

//Delete a user
router.delete('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    const message = await user.delete();
    return res.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
