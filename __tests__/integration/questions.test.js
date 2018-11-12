process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');
const Question = require('../../models/question');
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
    survey2,
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




// Test get questions route
describe('GET /questions', () => {
  it('should correctly return a list of questions by a survey id', async function () {
    let response = await request(app)
      .get('/questions')
      .query({ survey_id: survey1.id });
    expect(response.statusCode).toBe(200);
    expect(response.body.questions.length).toBe(1);
    expect(response.body.questions).toEqual(
      [
        {
          "_id": question1.id,
          "_survey_id": survey1.id,
          "title": question1.title,
          "type": question1.type
        }
      ]
    );

    response = await request(app)
      .get('/questions')
      .query({ survey_id: survey2.id });
    expect(response.statusCode).toBe(200);
    expect(response.body.questions.length).toBe(1);
    expect(response.body.questions).toEqual(
      [
        {
          "_id": question2.id,
          "_survey_id": survey2.id,
          "title": question2.title,
          "type": question2.type
        }
      ]
    );
  });
});

describe('GET /questions/:id', () => {
  it('should return details for a question', async function () {
    const response = await request(app).get(`/questions/${question1.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.question).toEqual({
      "_id": question1.id,
      "_survey_id": survey1.id,
      "title": question1.title,
      "type": question1.type
    })
  });

  it('should return a 404 if id not found', async function () {
    const response = await request(app).get('/questions/33797');
    expect(response.statusCode).toBe(404);
  })
})

describe('POST /questions', () => {
  it('should create a new question', async function () {
    let response = await request(app)
      .post('/questions')
      .send({
        _token: userToken,
        survey_id: survey1.id,
        title: 'TestQuestion1',
        type: 'ranked'
      });

    expect(response.body).toEqual({
      question: {
        _id: 3,
        _survey_id: survey1.id,
        title: 'TestQuestion1',
        type: 'ranked'
      }
    });

    response = await request(app)
      .get('/questions')
      .query({ survey_id: survey1.id });
    expect(response.body.questions.length).toBe(2);
  })

  it('should give 400 error for missing "not null" data', async function () {
    const response = await request(app)
      .post('/questions')
      .send({
        _token: userToken,
        survey_id: survey1.id,
        title: "amazzzzinggg"
      });

    expect(response.status).toEqual(400);
  });

  it('should not authorize if not logged in or bad token', async function () {
    const response = await request(app)
      .post('/questions')
      .send({
        _token: userToken.concat("3s8sd3"),
        survey_id: survey1.id,
        title: 'TestQuestionBadUser',
        type: 'ranked'
      });

    expect(response.status).toEqual(401);
  });
})


// describe('PATCH /surveys/:id', () => {
//   it('Should update the title of a survey only', async function() {
//     // first create a new survey by testUser
//     const postReponse = await request(app)
//       .post('/surveys')
//       .send({
//         _token: userToken,
//         title: 'xxSuperCoolTestSurveyxx',
//         description: '9999ThisIsDescriptive9999'
//       });

//     expect(postReponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');

//     const patchResponse = await request(app)
//       .patch(`/surveys/${postReponse.body.survey._id}`)
//       .send({
//         _token: userToken,
//         title: '__muchbetter__'
//       });

//     expect(patchResponse.body.survey.author).toEqual(testUser.username);
//     expect(patchResponse.body.survey.title).toEqual('__muchbetter__');
//     expect(patchResponse.body.survey.description).toEqual('9999ThisIsDescriptive9999');
//   });


//   it('Should update the description of a survey only', async function() {
//     // first create a new survey by testUser
//     const postReponse = await request(app)
//       .post('/surveys')
//       .send({
//         _token: userToken,
//         title: 'xxSuperCoolTestSurveyxx',
//         description: '9999ThisIsDescriptive9999'
//       });

//     expect(postReponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');

//     const patchResponse = await request(app)
//       .patch(`/surveys/${postReponse.body.survey._id}`)
//       .send({
//         _token: userToken,
//         description: '__muchbetter__'
//       });

//     expect(patchResponse.body.survey.author).toEqual(testUser.username);
//     expect(patchResponse.body.survey.description).toEqual('__muchbetter__');
//     expect(patchResponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');
//   });



//   it('Should update the title and description of a survey only', async function() {
//     // first create a new survey by testUser
//     const postReponse = await request(app)
//       .post('/surveys')
//       .send({
//         _token: userToken,
//         title: 'xxSuperCoolTestSurveyxx',
//         description: '9999ThisIsDescriptive9999'
//       });

//     expect(postReponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');

//     const patchResponse = await request(app)
//       .patch(`/surveys/${postReponse.body.survey._id}`)
//       .send({
//         _token: userToken,
//         description: '__muchbetter__',
//         title: '__bettertitle__'
//       });

//     expect(patchResponse.body.survey.author).toEqual(testUser.username);
//     expect(patchResponse.body.survey.description).toEqual('__muchbetter__');
//     expect(patchResponse.body.survey.title).toEqual('__bettertitle__');
//   });



//   it('Should ignore all invalid or immutable fields', async function() {
//     // first create a new survey by testUser
//     const postReponse = await request(app)
//       .post('/surveys')
//       .send({
//         _token: userToken,
//         title: 'xxSuperCoolTestSurveyxx',
//         description: '9999ThisIsDescriptive9999'
//       });

//     expect(postReponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');

//     const patchResponse = await request(app)
//       .patch(`/surveys/${postReponse.body.survey._id}`)
//       .send({
//         _token: userToken,
//         author: 'hackerman',
//         notdescription: '__muchbetter__',
//         title: '__bettertitle__'
//       });

//     expect(patchResponse.status).toBe(200);
//     expect(patchResponse.body.survey.author).toEqual(testUser.username);
//     expect(patchResponse.body.survey.description).toEqual('9999ThisIsDescriptive9999');
//     expect(patchResponse.body.survey.title).toEqual('__bettertitle__');
//   });

//   it('Should not authorize to update if survey owned by other user', async function() {
//     // first create a new survey by testUser
//     const postReponse = await request(app)
//       .post('/surveys')
//       .send({
//         _token: userToken,
//         title: 'xxSuperCoolTestSurveyxx',
//         description: '9999ThisIsDescriptive9999'
//       });

//     expect(postReponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');

//     /** Try to edit a survey whose author is "kevin" with the token for "hackerman" */
//     const patchResponse = await request(app)
//       .patch(`/surveys/${postReponse.body.survey._id}`)
//       .send({
//         _token: hackerToken,
//         author: 'hackerman',
//         notdescription: '__muchbetter__',
//         title: '__bettertitle__'
//       });

//     expect(patchResponse.status).toEqual(401);
//     expect(patchResponse.body.message).toEqual("Unauthorized");
//   });
// })

// describe('DELETE /surveys/:id', () => {
//   it('Should delete a survey', async function() {
//     // first create a new survey by testUser
//     const postReponse = await request(app)
//       .post('/surveys')
//       .send({
//         _token: userToken,
//         title: 'xxSuperCoolTestSurveyxx',
//         description: '9999ThisIsDescriptive9999'
//       });

//     expect(postReponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');

//     const deleteResponse = await request(app)
//       .delete(`/surveys/${postReponse.body.survey._id}`)
//       .send({
//         _token: userToken
//       });

//     expect(deleteResponse.status).toEqual(200);
//     expect(deleteResponse.body).toEqual("Deleted");

//     const getResponse = await request(app)
//       .get(`/surveys/${postReponse.body.survey._id}`)

//       expect(getResponse.status).toBe(404);
//   });


//   it('Should not authorize to delete if survey owned by other user', async function() {
//     // first create a new survey by testUser
//     const postReponse = await request(app)
//       .post('/surveys')
//       .send({
//         _token: userToken,
//         title: 'xxSuperCoolTestSurveyxx',
//         description: '9999ThisIsDescriptive9999'
//       });

//     expect(postReponse.body.survey.title).toEqual('xxSuperCoolTestSurveyxx');

//     /** Try to delete a survey whose author is "kevin" with the token for "hackerman" */
//     const deleteResponse = await request(app)
//       .delete(`/surveys/${postReponse.body.survey._id}`)
//       .send({
//         _token: hackerToken
//       });

//     expect(deleteResponse.status).toEqual(401);
//     expect(deleteResponse.body.message).toEqual("Unauthorized");
//   });
// })


//Delete tables after each tets
afterEach(async function () {
  await dropTables();
});

//Close db connection
afterAll(async function () {
  await db.end();
});
