process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');
const Question = require('../../models/question');
const {
  createTables,
  insertTestData,
  dropTables,
} = require('../../test_helpers/setup');

let survey1,
  survey2,
  survey3,
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
  username: 'kevin',
  password: 'kevin',
  first_name: 'kevin',
  last_name: 'kevin',
  email: 'kevin@kevin.com',
};

//Insert 2 users before each test
beforeEach(async function() {
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
    choice8,
  } = await insertTestData());

  let response = await request(app)
    .post('/users')
    .send({
      username: testUser.username,
      password: testUser.password,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      email: testUser.email,
    });
  userToken = response.body.token;

  let responseForHacker = await request(app)
    .post('/users')
    .send({
      username: 'hackerman',
      password: 'hackerman',
      first_name: 'hackerman',
      last_name: 'hackerman',
      email: 'hackerman@hacker.com',
    });
  hackerToken = responseForHacker.body.token;

  
  let surveyResponse = await request(app)
    .post('/surveys')
    .send({
      _token: userToken,
      title: 'xxSuperCoolTestSurveyxx',
      description: '9999ThisIsDescriptive9999'
    });
  survey3 = surveyResponse.body.survey;
});

// Test get questions route
describe('GET /surveys/:survey_id/questions', () => {
  it('should correctly return a list of questions by a survey id', async function() {
    let response = await request(app)
      .get(`/surveys/${survey1.id}/questions`);
    expect(response.statusCode).toBe(200);
    expect(response.body.questions.length).toBe(1);
    expect(response.body.questions).toEqual([
      {
        _id: question1.id,
        _survey_id: survey1.id,
        title: question1.title,
        type: question1.type,
      },
    ]);

    response = await request(app)
      .get(`/surveys/${survey2.id}/questions`);
    expect(response.statusCode).toBe(200);
    expect(response.body.questions.length).toBe(1);
    expect(response.body.questions).toEqual([
      {
        _id: question2.id,
        _survey_id: survey2.id,
        title: question2.title,
        type: question2.type,
      },
    ]);
  });
});

describe('GET /surveys/:survey_id/questions/:question_id', () => {
  it('should return details for a question', async function() {
    const response = await request(app).get(`/surveys/${survey1.id}/questions/${question1.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.question).toEqual({
      _id: question1.id,
      _survey_id: survey1.id,
      title: question1.title,
      type: question1.type,
      choices: [
        {
          _id: choice1.id,
          _question_id: question1.id,
          content: choice1.content,
          title: choice1.title,
        },
        {
          _id: choice2.id,
          _question_id: question1.id,
          content: choice2.content,
          title: choice2.title,
        },
        {
          _id: choice3.id,
          _question_id: question1.id,
          content: choice3.content,
          title: choice3.title,
        },
        {
          _id: choice4.id,
          _question_id: question1.id,
          content: choice4.content,
          title: choice4.title,
        },
      ]
    });
  });

  it('should return a 404 if id not found', async function() {
    const response = await request(app).get(`/surveys/${survey1.id}/questions/33797`);
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /surveys/:survey_id/questions', () => {
  it('should create a new question', async function() {
    let response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken,
        title: 'TestQuestion1',
        type: 'ranked',
      });

    expect(response.body).toEqual({
      question: {
        _id: 3,
        _survey_id: survey3._id,
        title: 'TestQuestion1',
        type: 'ranked',
      },
    });

    response = await request(app)
      .get(`/surveys/${survey3._id}/questions`)
    expect(response.body.questions.length).toBe(1);
  });

  it('should give 400 error for missing "not null" data', async function() {
    const response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken,
        title: 'amazzzzinggg',
      });

    expect(response.status).toEqual(400);
  });

  it('should not authorize if not logged in or bad token', async function() {
    const response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken.concat('3s8sd3'),
        title: 'TestQuestionBadUser',
        type: 'ranked',
      });

    expect(response.status).toEqual(401);
  });

  it('should only allow type multiple or ranked', async function() {
    let response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken,
        title: 'TestQuestion2',
        type: 'nonvalidtype',
      });

    expect(response.status).toEqual(400);
  });
});

describe('PATCH /surveys/:survey_id/questions/:question_id', () => {
  it('Should update the title of a question only', async function() {
    // first create a new question by testUser
    let response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken,
        title: 'TestQuestion1',
        type: 'ranked',
      });

    expect(response.body).toEqual({
      question: {
        _id: 3,
        _survey_id: survey3._id,
        title: 'TestQuestion1',
        type: 'ranked',
      },
    });

    let patchResponse = await request(app)
      .patch(`/surveys/${survey3._id}/questions/${response.body.question._id}`)
      .send({
        _token: userToken,
        title: '__muchbetter__',
      });

    expect(patchResponse.body.question.title).toEqual('__muchbetter__');
    expect(patchResponse.body.question.type).toEqual('ranked');
  });

  it('Should refuse to update the survey_id for a question', async function() {
    let response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken,
        title: 'TestQuestion1',
        type: 'ranked',
      });

    expect(response.body).toEqual({
      question: {
        _id: 3,
        _survey_id: survey3._id,
        title: 'TestQuestion1',
        type: 'ranked',
      },
    });

    const patchResponse = await request(app)
      .patch(`/surveys/${survey3._id}/questions/${response.body.question._id}`)
      .send({
        _token: userToken,
        title: '__bettertitle__',
        survey_id: 5000,
      });

    expect(patchResponse.status).toEqual(400);
  });
});

describe('DELETE /surveys/:survey_id/questions/:question_id', () => {
  it('Should delete a question', async function() {
    // first create a new question by testUser
    let response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken,
        title: 'TestQuestion1',
        type: 'ranked',
      });

    expect(response.body).toEqual({
      question: {
        _id: 3,
        _survey_id: survey3._id,
        title: 'TestQuestion1',
        type: 'ranked',
      },
    });

    const deleteResponse = await request(app)
      .delete(`/surveys/${survey3._id}/questions/3`)
      .send({
        _token: userToken,
      });

    expect(deleteResponse.status).toEqual(200);
    expect(deleteResponse.body).toEqual('Question Deleted');

    const getResponse = await request(app).get(
      `/surveys/${survey3._id}/questions/${response.body.question._id}`,
    );

    expect(getResponse.status).toBe(404);
  });

  it('Should not authorize to delete if survey for question is owned by other user', async function() {
    // first create a new question by testUser
    let response = await request(app)
      .post(`/surveys/${survey3._id}/questions`)
      .send({
        _token: userToken,
        title: 'TestQuestion1',
        type: 'ranked',
      });

    expect(response.body).toEqual({
      question: {
        _id: 3,
        _survey_id: survey3._id,
        title: 'TestQuestion1',
        type: 'ranked',
      },
    });

    // Try to delete a question whose author is "kevin" with the token for "hackerman"
    const deleteResponse = await request(app)
      .delete(`/surveys/${survey3.id}/questions/3`)
      .send({
        _token: hackerToken,
      });

    expect(deleteResponse.status).toEqual(401);
    expect(deleteResponse.body.message).toEqual('Unauthorized');
  });
});

//Delete tables after each tets
afterEach(async function() {
  await dropTables();
});

//Close db connection
afterAll(async function() {
  await db.end();
});
