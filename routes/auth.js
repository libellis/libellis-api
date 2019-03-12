const express = require('express');
const router = new express.Router();
const { authenticate } = require('../Core/Application/auth');

// Login a user
router.post('/login', async function (req, res, next) {
  try {
    const token = await authenticate(req.body);
    return res.json({ token });
  } catch (e) {
    return next({status: 400, message: "Invalid username/password"});
  }
});


module.exports = router;