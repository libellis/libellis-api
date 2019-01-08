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


// Insert one test user before each test
beforeEach(async function () {
  await createTables();
  const response = await request(app)
  .post('/signup')
  .send({
    username: 'testuser',
    password: 'password',
    first_name: 'test',
    last_name: 'user',
    email: 'test@testmail.com'
  }); 
});


describe('POST /signup', () => {
  it('should return a token for a new user', async function() {
    const response = await request(app)
      .post('/signup')
      .send({
        username: 'georgetheman',
        password: 'georgeisawesome',
        first_name: 'george',
        last_name: 'johnson',
        email: 'george@gmail.com'
      }); 
    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String))
  });

  it('should reject sign up if user already exists', async function() {
    const _ = await request(app)
      .post('/signup')
      .send({
        username: 'georgetheman',
        password: 'georgeisawesome',
        first_name: 'george',
        last_name: 'johnson',
        email: 'george@gmail.com'
      });

    const response = await request(app)
      .post('/signup')
      .send({
        username: 'georgetheman',
        password: 'georgeisawesome',
        first_name: 'george',
        last_name: 'johnson',
        email: 'george@gmail.com'
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual('Username "georgetheman" already exists')
  });


  it('should reject a sign with missing fields', async function() {
    const response = await request(app)
      .post('/signup')
      .send({
        username: 'georgetheman',
        password: 'georgeisawesome',
      }); 
    expect(response.status).toBe(400);
    response.body.error.map(e => {
      expect(e).toContain('instance requires property');
    });
  });
});

describe('POST /login', () => {
  it('should login a user', async function () {
    const response = await request(app)
    .post('/login')
    .send({
      username: 'testuser',
      password: 'password'
    }); 
  expect(response.status).toBe(200);
  expect(response.body.token).toEqual(expect.any(String))    
  });

  it('should reject a login with not existing username', async function () {
    const response = await request(app)
    .post('/login')
    .send({
      username: 'someuser',
      password: 'password'
    }); 
  expect(response.status).toBe(400);
  expect(response.body.error).toEqual('Invalid username/password');    
  });

  it('should reject a login with incorrect password', async function () {
    const response = await request(app)
    .post('/login')
    .send({
      username: 'testuser',
      password: 'wrongpassword'
    }); 
  expect(response.status).toBe(400);
  expect(response.body.error).toEqual('Invalid username/password');    
  });
});



// Delete tables after each tets
afterEach(async function () {
  await dropTables();
});

// Close db connection
afterAll(async function () {
  await db.end();
});