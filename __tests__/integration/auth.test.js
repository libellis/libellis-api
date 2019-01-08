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
  .post('/users')
  .send({
    username: 'testuser',
    password: 'password',
    first_name: 'test',
    last_name: 'user',
    email: 'test@testmail.com'
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