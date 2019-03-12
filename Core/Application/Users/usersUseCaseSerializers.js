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

function serializeGetAllUsersOutput(users) {
  return {
    users: users.map(user => {
      return {
        username: user._username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo_url: user.photo_url,
        is_admin: user.is_admin,
      }
    })
  };
}

function serializeGetUserInput(req, res, next) {
  req.requestObj = {
    token: req.token,
    username: req.params.username,
  };
  return next();
}

function serializeGetUserOutput(user) {
  return {
    user: {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      photo_url: user.photo_url,
      is_admin: user.is_admin,
    }
  };
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

function serializeCreateUserOutput(newUser) {
  return {
    username: newUser.username,
    email: newUser.email,
    is_admin: newUser.is_admin || false,
  };
}

module.exports = {
  serializeGetAllUsersInput,
  serializeGetAllUsersOutput,
  serializeGetUserInput,
  serializeGetUserOutput,
  serializeCreateUserInput,
  serializeCreateUserOutput,
}