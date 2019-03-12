const {
  classPartialUpdate
} = require('../../helpers/partialUpdate');
const UnitOfWork = require('../../Persistence/UnitOfWork');
const User = require('../Domain/user');
const {validateInput} = require('./validation');
const newUserSchema = require('../../schema/newUser.json');
const updateUserSchema = require('../../schema/updateUser.json');
const { SECRET } = require('../../config');
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
      // payload extracted successfully, otherwise error
      // would have been thrown and pushed up the chain.
      return true; 

    default:
      return false;
  }
}
async function getAllUsersIfAdmin(token) {
  if (authorize({token}, 0)) {
    const unitOfWork = new UnitOfWork();
    const users = await unitOfWork.users.getAll({});
    
    // Filter the data down so we don't directly return entitities -
    // but instead plain old POJO - Entities shouldn't interact with routes
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
    
  } else {
    throw new Error("You must be an admin to get a list of all users.");
  }
}

async function getUserIfAdminOrOwner({token, username}) {
  if (authorize({token, username}, 1)) {
    const unitOfWork = new UnitOfWork();
    
    let user;
    try {
      user = await unitOfWork.users.get({username});
    } catch (e) {
      let error = new Error();
      error.type = "ResourceNotFound";
      error.message = `Cannot find user by username: ${username}`;
      throw error;
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
    let error = new Error();
    error.type = "Unauthorized";
    error.message = "You cannot access a users details unless you own the account, or are an admin.";
    throw error;
  }
}

async function createUserIfSchemaIsValid(userData) {
  // Will throw error internally if not valid
  validateInput(userData, newUserSchema);

  const unitOfWork = new UnitOfWork();
  const newUser = new User(userData);

  // add password this way so it hits our setter and gets hashed
  newUser.password = userData.password;
  unitOfWork.users.add(newUser);
  unitOfWork.complete();

  return {
    username: newUser.username,
    email: newUser.email,
    is_admin: newUser.is_admin,
  };
}

async function updateUserIfAdminOrOwner({token, username}, userChangeSet) {
  if (authorize({token, username}, 1)) {
    const unitOfWork = new UnitOfWork();
    const user = unitOfWork.users.get({username});

    // update values from userChangeSet if they match up to values
    // in the user domain model instance
    classPartialUpdate(user, userChangeSet);

    unitOfWork.users.save(user);
    unitOfWork.complete();

    return JSON.stringify({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      photo_url: user.photo_url,
      is_admin: user.is_admin,
    });
  } else {
    throw new Error("You cannot modify an account unless you own the account, or are an admin.")
  }
}

async function deleteUserIfAdminOrOwner({token, username}) {
  if (authorize({token, username}, 1)) {
    const unitOfWork = new UnitOfWork();
    const user = unitOfWork.users.get({username});

    unitOfWork.users.remove(user);
    unitOfWork.complete();
  } else {
    throw new Error("You cannot delete an account unless you own the account, or are an admin.")
  }
}

module.exports = {
  getAllUsersIfAdmin,
  getUserIfAdminOrOwner,
  createUserIfSchemaIsValid,
  updateUserIfAdminOrOwner,
  deleteUserIfAdminOrOwner,
}