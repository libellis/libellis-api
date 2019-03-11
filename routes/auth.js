const express = require('express');
const router = new express.Router();
const { authenticate } = require('../Core/Application/auth');

// Login a user
router.post('/login', async function (req, res, next) {
  try {
    const token = authenticate(req.body);
    return res.json( token );
  } catch (error) {
    error.status = 400;
    return next(error);
  }
});


module.exports = router;