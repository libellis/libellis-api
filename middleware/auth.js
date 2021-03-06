/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET } = require("../config.js");
const Survey = require("../models/survey");

/** Middleware: Requires user is logged in. */

function ensureLoggedIn(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    let { username } = jwt.verify(token, SECRET);
    // put username on request as a convenience for routes
    req.username = username;
    return next();
  }

  catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

/** Middleware: Requires :username is logged in. */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    const payload = jwt.verify(token, SECRET);
    if (payload.username === req.params.username || payload.is_admin) {
      // put username on request as a convenience for routes
      req.username = payload.username;
      return next();
    } else {
      throw new Error();
    }
  }

  catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

function ensureAdminUser(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    const payload = jwt.verify(token, SECRET);
    if (payload.is_admin) {
      req.username = payload.username;
      return next();
    } else {
      throw new Error();
    }
  }

  catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

/** requires login */
async function ensureAuthor(req, res, next) {
  try {
    let survey = await Survey.get(req.params.id);

    // put survey object onto req for route function to use
    req.survey = survey;

    // if user is not author of survey, throw 401
    if (req.survey.author !== req.username)
      throw new Error();

    return next();
  } catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

module.exports = {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  ensureAdminUser,
  ensureAuthor
};
