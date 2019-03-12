const {
  classPartialUpdate
} = require('../../../helpers/partialUpdate');
const UnitOfWork = require('../../../Persistence/UnitOfWork');
const User = require('../../Domain/user');
const { serializeGetAllUsersOutput, serializeGetUserOutput, serializeCreateUserOutput } = require('./usersUseCaseSerializers');
const { validateSchema } = require('../validation');
const newUserSchema = require('../../../schema/newUser.json');
const updateUserSchema = require('../../../schema/updateUser.json');
const { SECRET } = require('../../../config');
const jwt = require('jsonwebtoken');

function extractPayload(token) {
  let payload = jwt.verify(token, SECRET);

  return payload;
}

function isAdmin(payload) {
  return (payload.is_admin === true);
}

function isOwner(payload, username) {
  return (payload.username === username);
}

function authorize({ token, username }, level) {
  if (token === undefined) return false;

  const payload = extractPayload(token);
  switch (level) {
    case 0:
      return isAdmin(payload);

    case 1:
      return isAdmin(payload) || isOwner(payload, username);

    case 2:
      // payload extracted successfully already, 
      return true;

    default:
      return false;
  }
}
async function getAllUsersIfAdmin(requestObj) {
  if (authorize(requestObj, 0)) {
    const unitOfWork = new UnitOfWork();
    const users = await unitOfWork.users.getAll({});

    return serializeGetAllUsersOutput(users); 
  } else {
    const error = new Error("You must be an admin to get a list of all users.");
    error.type = "Unauthorized";
    throw error;
  }
}

async function getUserIfAdminOrOwner({ token, username }) {
  if (authorize({ token, username }, 1)) {
    const unitOfWork = new UnitOfWork();

    let user;
    try {
      user = await unitOfWork.users.get({ username });
    } catch (e) {
      let error = new Error(`Cannot find user by username: ${username}`);
      error.type = "NotFound";
      throw error;
    }

    return serializeGetUserOutput(user);
  } else {
    let error = new Error("You cannot access a users details unless you own the account, or are an admin.");
    error.type = "Unauthorized";
    throw error;
  }
}

async function createUserWithValidSchema(userData) {
  const unitOfWork = new UnitOfWork();

  if (await userExists(userData.username, unitOfWork)) {
    const error = new Error(`Username "${userData.username}" already exists`);
    error.type = "DuplicateResource";
    throw error;
  }

  const newUser = new User(userData);
  unitOfWork.users.add(newUser);

  try {
    await unitOfWork.complete();
  } catch (e) {
    throw e;
  }

  return serializeCreateUserOutput(newUser);
}

async function userExists(username, unitOfWork) {
  try {
    await unitOfWork.users.get({ username });
  } catch (e) {
    return false;
  }
  return true;
}

async function updateUserIfAdminOrOwner({ token, username, userChangeSet }) {
  if (authorize({ token, username }, 1)) {
    // Will throw error internally if not valid
    validateSchema(userChangeSet, updateUserSchema);

    const unitOfWork = new UnitOfWork();

    let user;
    try {
      user = await unitOfWork.users.get({ username });
    } catch (e) {
      const error = new Error("No such user exists.");
      error.type = "NotFound";
      throw error;
    }

    // update values from userChangeSet if they match up to values
    // in the user domain model instance
    classPartialUpdate(user, userChangeSet);

    unitOfWork.users.save(user);

    try {
      await unitOfWork.complete();
    } catch (e) {
      throw e;
    }

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
  } else {
    const error = new Error("You cannot modify an account unless you own the account, or are an admin.");
    error.type = "Unauthorized";
    throw error;
  }
}

async function deleteUserIfAdminOrOwner({ token, username }) {
  if (authorize({ token, username }, 1)) {
    const unitOfWork = new UnitOfWork();

    let user;
    try {
      user = await unitOfWork.users.get({ username });
    } catch (e) {
      const error = new Error("No such user exists.");
      error.type = "NotFound";
      throw error;
    }

    unitOfWork.users.remove(user);

    try {
      await unitOfWork.complete();
    } catch (e) {
      throw e;
    }

    return {
      message: "User Deleted"
    }

  } else {
    const error = new Error("You cannot delete an account unless you own the account, or are an admin.")
    error.type = "Unauthorized";
    throw error;
  }
}

module.exports = {
  getAllUsersIfAdmin,
  getUserIfAdminOrOwner,
  createUserWithValidSchema,
  updateUserIfAdminOrOwner,
  deleteUserIfAdminOrOwner,
}