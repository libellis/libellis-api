const User = require('../models/user');

async function userFactory(data) {
  const { username, password, first_name, last_name, email, is_admin } = data;

  const user = await User.createUser({
    username,
    password,
    first_name,
    last_name,
    email,
    is_admin
  });

  user.token = await User.authenticate({ username, password });

  return user;
}

module.exports = userFactory;