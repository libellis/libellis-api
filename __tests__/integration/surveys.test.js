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
  await dropTables();
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
});




// Test get surveys route
describe('GET /surveys', () => {
  it('should correctly return a list of surveys', async function () {
    const response = await request(app).get('/surveys');
    expect(response.statusCode).toBe(200);
    expect(response.body.surveys.length).toBe(2);
    expect(response.body.surveys).toEqual(
      [
        {
          _id: expect.any(Number),
          author: 'joerocket',
          title: 'best albums of 2009',
          description: 'hot fiya',
          date_posted: expect.any(String),
          anonymous: true
        },
        {
          _id: expect.any(Number),
          author: 'spongebob',
          title: 'top ceos',
          description: 'top ceos of all time',
          date_posted: expect.any(String),
          anonymous: true
        }
      ]
    );
  });
});

// describe('GET /surveys/:id', () => {
//   it('should return details for a survey by by', async function() {
//     const response = await request(app).get(`/surveys/${survey1}`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body.survey).toEqual({
//       _id: expect.any(Number),
//       author: 'joerocket',
//       title: 'best albums of 2009',
//       description: 'hot fiya',
//       date_posted: expect.any(String),
//       anonymous: true
//     })
//   });

//   // it('should return a 404 Not Found when id not found', async function() {
//   //   const response = await request(app).get('/surveys/33797');
//   //   expect(response.statuCode).toBe(404);
//   // })
// })



//Delete tables after each tets
afterEach(async function () {
  await dropTables();
});

//Close db connection
afterAll(async function () {
  await db.end();
});