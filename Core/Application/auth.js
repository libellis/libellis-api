const { db } = require('db');
const { UnitOfWork } = require('../../Persistence/Repositories/UnitOfWork');
const bcrypt = require('bcryptjs');
const { BWF, SECRET, DEFAULT_PHOTO } = require('../../config');
const jwt = require('jsonwebtoken');

/**
 * 
 * 0 - Admin
 * 1 - Admin or Correct User (User resource)
 * 2 - Admin or Author (Survey resource)
 * 3 - Logged in
 */

// Authenticate user - returns JWT
async function authenticate({ db }, { username, password }) {
  const unitOfWork = new UnitOfWork(db);
  const user = unitOfWork.users.get({ username });
  if (user) {
    if (bcrypt.compareSync(username.password, user.password)) {
      const token = jwt.sign({ username, is_admin: user.is_admin }, SECRET);
      return token;
    }
  }
  throw new Error('Invalid username/password')
}

function verifyToken(token) {
  let { username } = jwt.verify(token, SECRET);
  return username;
}

function ensureLoggedIn(token) {

}

async function authorize(token, level) {
  switch (level) {
    case 3:
      return verifyToken(token)
      break;

    default:
      break;
  }

}


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
