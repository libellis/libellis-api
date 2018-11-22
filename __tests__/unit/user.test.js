process.env.NODE_ENV = 'test';
const User = require('../../models/user');
const db = require('../../db');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');

let survey1, survey2, question1, question2, user1, user2;
// Insert 2 users before each test
beforeEach(async function () {
  // Build up our test tables and return inserted test questions, surveys and users
  await createTables();
  ({
    question1,
    question2,
    survey1,
    survey2,
    user1,
    user2
  } = await insertTestData());
});

// Test get filtered users
describe('getUsers()', () => {
  it('should correctly return a list of users', async function () {
    const users = await User.getUsers();

    // Check that returned structure matches this exactly
    expect(users).toEqual([{
        _username: user1.username,
        first_name: user1.first_name,
        last_name: user1.last_name,
        email: user1.email
      },
      {
        _username: user2.username,
        first_name: user2.first_name,
        last_name: user2.last_name,
        email: user2.email
      }
    ]);
  });
});

// Test creating user
describe('createUser()', () => {
  it('should correctly add a user', async function () {
    const newUser = await User.createUser({
      username: 'bobcat',
      password: 'bob',
      first_name: 'bob',
      last_name: 'johnson',
      email: 'bob@gmail.com'
    });
    expect(newUser).toHaveProperty('is_admin', false);
    expect(newUser).toHaveProperty(
      'photo_url',
      'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg'
    );
    // Make sure password got hashed
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [newUser.username]
    );
    expect(result.rows[0].password === 'bob').toBe(false);
    const users = await User.getUsers();
    expect(users.length).toEqual(3);
  });
});

// Test get one user
describe('getUser()', () => {
  it('should correctly return a user by username', async function () {
    const user = await User.getUser(user1.username);
    expect(user.username).toEqual(user1.username);
    expect(user.email).toEqual(user1.email);

    // Get a user that doesn't exist and check failure
    try {
      await User.getUser('nouser');
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Cannot find user by username: nouser`);
    }
  });
});


/** Get Surveys authored by user */
describe('getSurveys()', () => {
  it('should return a list of surveys authored by a user', async function () {
    const surveys = await User.getSurveys(user1.username);
    expect(surveys).toEqual([{
      "_id": 1,
      "anonymous": true,
      "author": "joerocket",
      "date_posted": expect.any(Date),
      "description": "hot fiya",
      "published": false,
      "title": "best albums of 2009"
    }]);
  });
});


// Authenticate one user
describe('authenticate()', () => {
  it('should correctly return a json web token', async function () {
    const newUser = await User.createUser({
      username: 'bobcat',
      password: 'bob',
      first_name: 'bob',
      last_name: 'johnson',
      email: 'bob@gmail.com'
    });

    const token = await User.authenticate({
      username: newUser.username,
      password: 'bob'
    });
    expect(token !== undefined).toEqual(true);
    expect(token === 'bob').toEqual(false);

    // Try wrong password and catch error
    try {
      await User.authenticate(newUser.username, 'wrongpass');
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Invalid username/password`);
    }
  });
});

// Update a user test
describe('updateUser()', () => {
  it('should correctly update a user', async function () {
    let user = await User.getUser(user1.username);
    user.first_name = 'Josephina';

    await user.save();

    user = await User.getUser(user1.username);
    expect(user.first_name).toEqual('Josephina');

    const users = await User.getUsers({});
    expect(users.length).toEqual(2);

    expect(() => {
      user.username = 'JosephinaRocketina';
    }).toThrowError(`Can't change username!`);
  });
});

// Delete a user test
describe('deleteUser()', () => {
  it('should correctly delete a user', async function () {
    const user = await User.getUser(user1.username);
    const message = await user.deleteUser();
    expect(message).toBe('User Deleted');
  });
});

// Delete all tables after each tets
afterEach(async function () {
  await dropTables();
});

// Close db connection
afterAll(async function () {
  await db.end();
});