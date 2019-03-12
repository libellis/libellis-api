const { validateSchema } = require('../validation');
const newUserSchema = require('../../../schema/newUser.json');
const updateUserSchema = require('../../../schema/updateUser.json');
const assignStatusCode = require('../../../helpers/httpStatusCodeAssigner');

function serializeGetAllUsersInput(req, res, next) {
  req.requestObj = {
    token: req.token,
  };
  return next();
}

function serializeGetUserInput(req, res, next) {
  req.requestObj = {
    token: req.token,
    username: req.params.username,
  };
  return next();
}

function serializeCreateUserInput(req, res, next) {
  try {
    validateSchema(req.body, newUserSchema);
  } catch (error) {
    assignStatusCode(error);
    return next(error);
  }
  
  req.requestObj = req.body; 
  return next();
}

function serializeUpdateUserInput(req, res, next) {
  try {
    validateSchema(req.body, updateUserSchema);
  } catch (error) {
    assignStatusCode(error);
    return next(error);
  }
  
  req.requestObj = {
    token: req.token,
    username: req.params.username,
    userChangeSet: req.body,
  };
  return next();
}

function serializeDeleteUserInput(req, res, next) {
  req.requestObj = {
    token: req.token,
    username: req.params.username,
  };
  return next();
}

module.exports = {
  serializeGetAllUsersInput,
  serializeGetUserInput,
  serializeCreateUserInput,
  serializeUpdateUserInput,
  serializeDeleteUserInput,
}