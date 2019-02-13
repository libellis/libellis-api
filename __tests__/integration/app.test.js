/**
 * DEVELOPMENT MODE TESTING
 */

process.env.NODE_ENV = 'development';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');

let survey1,
  question1,
  question2,
  user1,
  choice1,
  choice2,
  choice3,
  choice4,
  choice5,
  choice6,
  choice7,
  choice8,
  userToken,
  hackerToken;

let testUser = {
  "username": "kevin",
  "password": "kevin",
  "first_name": "kevin",
  "last_name": "kevin",
  "email": "kevin@kevin.com"
};

//Insert 2 users before each test
beforeEach(async function () {
  await createTables();

  // insert test data and store it in variables
  ({
    question1,
    question2,
    survey1,
    user1,
    choice1,
    choice2,
    choice3,
    choice4,
    choice5,
    choice6,
    choice7,
    choice8
  } = await insertTestData());

  let response = await request(app)
    .post('/users')
    .send({
      "username": testUser.username,
      "password": testUser.password,
      "first_name": testUser.first_name,
      "last_name": testUser.last_name,
      "email": testUser.email
    });
  userToken = response.body.token;

  let responseForHacker = await request(app)
    .post('/users')
    .send({
      "username": "hackerman",
      "password": "hackerman",
      "first_name": "hackerman",
      "last_name": "hackerman",
      "email": "hackerman@hacker.com",
    });
  hackerToken = responseForHacker.body.token;
});

describe('test module importing', () => {
  it('should correctly load all modules in development mode', async function () {
    // Dummy test - just make sure we imported morgan correctly - no real way
    // to test it other than run over the line and see we didn't error out
    const response = await request(app).get('/surveys');
  });
});

// Delete all tables after each test
afterEach(async function () {
  await dropTables();
});

// Close db connection
afterAll(async function () {
  await db.end();
});
