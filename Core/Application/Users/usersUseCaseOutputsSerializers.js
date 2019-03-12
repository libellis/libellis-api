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

function serializeCreateUserOutput(newUser) {
  return {
    username: newUser.username,
    email: newUser.email,
    is_admin: newUser.is_admin || false,
  };
}

function serializeUpdateUserOutput(user) {
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

function serializeDeleteUserOutput(user) {
  return {
    message: "User Deleted"
  }
}

module.exports = {
  serializeGetAllUsersOutput,
  serializeGetUserOutput,
  serializeCreateUserOutput,
  serializeUpdateUserOutput,
  serializeDeleteUserOutput,
}