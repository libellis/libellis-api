const { db } = require('db');
const { UnitOfWork } = require('../../Persistence/Repositories/UnitOfWork');
const bcrypt = require('bcryptjs');
const { BWF, SECRET, DEFAULT_PHOTO } = require('../../config');
const jwt = require('jsonwebtoken');

// Authenticate user - returns JWT
async function authenticate({ db }, loginData) {
  const unitOfWork = new UnitOfWork(db);
  const user = unitOfWork.users.get(loginData);
  if (user) {
    if (bcrypt.compareSync(loginData.password, user.password)) {
      const token = jwt.sign({ username, is_admin: user.is_admin }, SECRET);
      return token;
    }
  }
  throw new Error('Invalid username/password')
}

