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
});




// Test get surveys route
describe('GET /surveys', () => {
  it('should correctly return a list of surveys', async function () {
    const response = await request(app).get('/surveys');
    expect(response.statusCode).toBe(200);
    expect(response.body.surveys.length).toBe(2);
    expect(response.body.surveys).toEqual(
      [{
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

describe('GET /surveys/:id', () => {
  it('should return details for a survey by by', async function () {
    const response = await request(app).get(`/surveys/${survey1.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.survey).toEqual({
      _id: expect.any(Number),
      author: 'joerocket',
      title: 'best albums of 2009',
      description: 'hot fiya',
      date_posted: expect.any(String),
      anonymous: true
    })
  });

  // it('should return a 404 Not Found when id not found', async function() {
  //   const response = await request(app).get('/surveys/33797');
  //   expect(response.statuCode).toBe(404);
  // })
})

describe('POST /surveys', () => {
  it('should create a new survey', async function () {
    let response = await request(app)
      .post('/surveys')
      .send({
        _token: userToken,
        title: 'xxSuperCoolTestSurveyxx',
        description: '9999ThisIsDescriptive9999'
      });

    expect(response.body).toEqual({
      survey: {
        _id: 3,
        author: testUser.username,
        title: 'xxSuperCoolTestSurveyxx',
        description: '9999ThisIsDescriptive9999',
        date_posted: expect.any(String),
        anonymous: true
      }
    });

    response = await request(app).get('/surveys');
    expect(response.body.surveys.length).toBe(3);
  })

  it('should return an 400 error for missing title', async function() {
    const response = await request(app)
      .post('/surveys')
      .send({
        _token: userToken,
        description: '9999ThisIsDescriptive9999'
      });

    expect(response.status).toEqual(400);
    console.log(response.error.message);
    // expect(response.error.message).toEqual("instance requires property \"title\"");
  });

  it('should return an 401 unauthorized if not logged in or bad token', async function() {
    const response = await request(app)
      .post('/surveys')
      .send({
        _token: userToken.concat("3s8sd3"),
        title: 'xxSuperCoolTestSurveyxx',
        description: '9999ThisIsDescriptive9999'
      });

    expect(response.status).toEqual(401);
    console.log(response.error.message);
    // expect(response.error).toEqual("Not authorized");
  });

})



//Delete tables after each tets
afterEach(async function () {
  await dropTables();
});

//Close db connection
afterAll(async function () {
  await db.end();
});