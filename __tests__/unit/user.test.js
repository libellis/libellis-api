process.env.NODE_ENV = 'test';
const User = require('../../models/user');
const db = require('../../db');
const {
  createTables,
  clearTables,
  dropTables
} = require('../../test_helpers/setup');

const userFactory = require("../../factories/userFactory");
const surveyFactory = require("../../factories/surveyFactory");
const categoryFactory = require("../../factories/categoryFactory");
const { userData, surveyData } = require("../../test_helpers/sample");

beforeAll(async function () {
  await createTables();
});

// Test get filtered users
describe('getUsers()', () => {
  // 
  it('should correctly return a list of users', async function () {
    const user1 = await userFactory(userData[0]);
    const user2 = await userFactory(userData[1]);

    const users = await User.getUsers();

    // Check that returned structure matches this exactly
    expect(users).toEqual([
      {
        _username: user1._username,
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
    const testUser = userData[0];
    const newUser = await User.createUser({
      username: testUser.username,
      password: testUser.password,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      email: testUser.email
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

    const user = result.rows[0];
    expect(user.password === testUser.password).toBe(false);
    const users = await User.getUsers();
    expect(users[0]._username == testUser.username).toBe(true);
    expect(users.length).toEqual(1);
  });
});

// Test get one user
describe('getUser()', () => {
  it('should correctly return a user by username', async function () {
    const user1 = await userFactory(userData[0]);

    const user = await User.getUser(user1._username);
    expect(user._username).toEqual(user1._username);
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
    const user = await userFactory(userData[0]);

    const category1 = await categoryFactory(surveyData[0]);
    const survey1 = await surveyFactory(surveyData[0]);
    console.log("Survey 1", survey1);

    const category2 = await categoryFactory(surveyData[1]);
    const survey2 = await surveyFactory(surveyData[1]);
    console.log("Survey 2", survey2);

    expect(survey1.id).toEqual(expect.any(Number));
    expect(survey1.author).toEqual(userData[0].username);
    expect(survey1.title).toEqual(surveyData[0].title);
    expect(survey1.description).toEqual(surveyData[0].description);
    expect(survey1.category).toEqual(surveyData[0].category)
    expect(survey1.date_posted).toEqual(expect.any(Date))
    expect(survey1.anonymous).toEqual(true)

    expect(survey2.id).toEqual(expect.any(Number));
    expect(survey2.author).toEqual(userData[0].username);
    expect(survey2.title).toEqual(surveyData[1].title);
    expect(survey2.description).toBeNull();
    expect(survey2.category).toEqual(surveyData[1].category)
    expect(survey2.date_posted).toEqual(expect.any(Date))
    expect(survey2.anonymous).toEqual(true)
  });
});

// /** Get Surveys taken by user */
// describe('getHistory()', () => {
//   it('should return a list of surveys taken by a user', async function() {
//     const surveys = await User.getHistory(user1.username);
//     expect(surveys).toEqual([
//       {
//         anonymous: true,
//         date_posted: expect.any(Date),
//         author: 'joerocket',
//         description: 'hot fiya',
//         published: false,
//         survey_id: 1,
//         title: 'best albums of 2009'
//       }
//     ]);
//   });
// });

// // Authenticate one user
// describe('authenticate()', () => {
//   it('should correctly return a json web token', async function() {
//     const newUser = await User.createUser({
//       username: 'bobcat',
//       password: 'bob',
//       first_name: 'bob',
//       last_name: 'johnson',
//       email: 'bob@gmail.com'
//     });

//     const token = await User.authenticate({
//       username: newUser.username,
//       password: 'bob'
//     });
//     expect(token !== undefined).toEqual(true);
//     expect(token === 'bob').toEqual(false);

//     // Try wrong password and catch error
//     try {
//       await User.authenticate(newUser.username, 'wrongpass');
//       throw new Error();
//     } catch (e) {
//       expect(e.message).toMatch(`Invalid username/password`);
//     }
//   });
// });

// // Update a user test
// describe('updateUser()', () => {
//   it('should correctly update a user', async function() {
//     let user = await User.getUser(user1.username);
//     user.first_name = 'Josephina';

//     await user.save();

//     user = await User.getUser(user1.username);
//     expect(user.first_name).toEqual('Josephina');

//     const users = await User.getUsers({});
//     expect(users.length).toEqual(2);

//     expect(() => {
//       user.username = 'JosephinaRocketina';
//     }).toThrowError(`Can't change username!`);
//   });

//   it('should fail to update a non-existent user', async function() {
//     let fakeuser = new User({
//       username: 'fakeuser',
//       first_name: 'fake',
//       last_name: 'user',
//       email: 'fake@fakeuser.com',
//       photo_url: 'superfake.jpg',
//       is_admin: true
//     });

//     try {
//       fakeuser.first_name = 'superfake';
//       await fakeuser.save();
//       throw new Error();
//     } catch (e) {
//       expect(e.message).toMatch(`Cannot find user to update`);
//     }
//   });
// });

// // Delete a user test
// describe('deleteUser()', () => {
//   it('should correctly delete a user', async function() {
//     const user = await User.getUser(user1.username);
//     const message = await user.deleteUser();
//     expect(message).toBe('User Deleted');
//   });

//   it('should fail to delete a user twice', async function() {
//     try {
//       const user = await User.getUser(user1.username);
//       const message = await user.deleteUser();
//       const failed = await user.deleteUser();
//     } catch (e) {
//       expect(e.message).toMatch(`Could not find user to delete`);
//     }
//   });
// });

// Clear rows from tables
afterEach(async function () {
  await clearTables();
});

// Drop tables and close db connection
afterAll(async function () {
  await dropTables();
  await db.end();
});
