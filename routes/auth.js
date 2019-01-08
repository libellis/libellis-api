const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const validateInput = require('../middleware/validation');
const newUserSchema = require('../schema/newUser.json');

// Login a user
router.post('/login', async function (req, res, next) {
  try {
    const token = await User.authenticate(req.body);
    return res.json({ token });
  } catch (error) {
    error.status = 400;
    return next(error);
  }
});


module.exports = router;