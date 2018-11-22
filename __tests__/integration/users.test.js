process.env.NODE_ENV = 'test';
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
  survey2,
  question1,
  question2,
  user1,
  user2,
  user3,
  choice1,
  choice2,
  choice3,
  choice4,
  choice5,
  choice6,
  choice7,
  choice8,
  userToken;
//Insert 2 users before each test
beforeEach(async function () {
  await createTables();
  ({
    question1,
    question2,
    survey1,
    survey2,
    user1,
    user2,
    choice1,
    choice2,
    choice3,
    choice4,
    choice5,
    choice6,
    choice7,
    choice8
  } = await insertTestData());
  const response = await request(app)
    .post('/users')
    .send({
      username: 'georgetheman',
      password: 'georgeisawesome',
      first_name: 'george',
      last_name: 'johnson',
      email: 'george@gmail.com'
    });
  user3 = await User.getUser('georgetheman');
  userToken = response.body.token;
});

//Test get users route
describe('GET /users', () => {
  it('should correctly return a list of users', async function () {
    const response = await request(app).get('/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(3);
    expect(response.body.users[0]).toHaveProperty('_username', user1.username);
  });
});

//Test create user route
describe('POST /users', () => {
  it('should correctly create a new user and return it', async function () {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'bobcat',
        password: 'bob',
        first_name: 'bob',
        last_name: 'johnson',
        email: 'bob@gmail.com'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');

    // TEST FOR JSON SCHEMA
    const invalidResponse = await request(app)
      .post('/users')
      .send({
        username: 'bobcat',
        password: 'bob',
        first_name: 'bob',
        last_name: 'johnson',
        email: 'bob.com'
      });

    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test get one user route
describe('GET /users/:username', () => {
  it('should correctly return a user by username', async function () {
    const response = await request(app)
      .get(`/users/${user3.username}`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      _username: 'georgetheman',
      first_name: 'george',
      last_name: 'johnson',
      email: 'george@gmail.com',
      photo_url:
        'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg',
    });
  });
});


// test get surveys created by user
describe('GET /users/:username/surveys', () => {
  it('should get an empty array of surveys for existing user with no created surveys', async function () {
    const response = await request(app)
      .get(`/users/${user3.username}/surveys`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({surveys: []});
  });

  it('should get an empty array of surveys for existing user with no created surveys', async function () {
    const response = await request(app)
      .get(`/users/${user3.username}/surveys`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({surveys: []});
  });
});

//Test updating a user route
describe('PATCH /users/:username', () => {
  it('should correctly update a user and return it', async function () {
    const response = await request(app)
      .patch(`/users/${user3.username}`)
      .send({
        first_name: 'Josephina'
      })
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.user._username).toBe(user3.username);
    expect(response.body.user.first_name).toBe('Josephina');

    //TEST FOR JSON SCHEMA
    const invalidResponse = await request(app)
      .patch(`/users/${user3.username}`)
      .send({
        first_name: 20,
        last_name: null,
        _token: userToken
      });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test deleting a user route
describe('DELETE /users/:username', () => {
  it('should correctly delete a user', async function () {
    const response = await request(app)
      .delete(`/users/${user3.username}`)
      .send({
        _token: userToken
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User Deleted');
  });
});

//Delete tables after each tets
afterEach(async function () {
  await dropTables();
});

//Close db connection
afterAll(async function () {
  await db.end();
});
