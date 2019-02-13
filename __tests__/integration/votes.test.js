process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');
const Question = require('../../models/question');
const Vote = require('../../models/vote');
const {
  createTables,
  insertTestData,
  dropTables,
} = require('../../test_helpers/setup');

let testUser = {
  username: 'kevin',
  password: 'kevin',
  first_name: 'kevin',
  last_name: 'kevin',
  email: 'kevin@kevin.com',
};
let vote1,
  vote2,
  vote3,
  vote4,
  vote5,
  vote6,
  vote7,
  vote8,
  vote9,
  vote10,
  question1,
  question2,
  choice1,
  choice3,
  choice4,
  choice5,
  choice6,
  choice7,
  choice8,
  survey1,
  survey2,
  user1,
  user2,
  user3;

// Insert 2 votes before each test
beforeEach(async function() {
  // Build up our test tables and return inserted test votes, choices, questions and users
  await createTables();
  ({
    vote1,
    vote2,
    vote3,
    vote4,
    vote5,
    vote6,
    vote7,
    vote8,
    vote9,
    vote10,
    choice1,
    choice3,
    choice4,
    choice5,
    choice6,
    choice7,
    choice8,
    survey1,
    survey2,
    question1,
    question2,
    user1,
    user2,
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
describe('GET /surveys/:survey_id/votes', () => {
  it('should correctly return a list of votes by a survey id', async function() {
    let response = await request(app)
      .get(`/surveys/${survey1.id}/votes`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toEqual([
      {"question_id": 1, 
      "vote_results": [
        {
          "choice_title": "Beats Antique", 
          "question_title": "Favorite EDM Artist", 
          "votes": "2"
        }]
      }
    ]);
  });

  it('should correctly return a list of votes by survey id for ranked question',
  async function () {
    response = await request(app)
      .get(`/surveys/${survey2.id}/votes`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toEqual(
      [ { question_id: 2,
          vote_results:
           [ { votes: '7',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Elie Schoppik' },
             { votes: '6',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Steve Jerbs' },
             { votes: '5',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Matthew Lane' },
             { votes: '2',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Chill Gates' } 
            ] 
        } 
      ]
    );
  })
});


describe('POST /surveys/:survey_id/votes', () => {
  it('should allow user to cast all votes for a multiple choice survey', async () => {
    let response = await request(app)
      .post(`/surveys/${survey1.id}/votes`)
      .send({
        _token: userToken,
        votes: [
          {question_id: question1.id,
            vote_data: [
            {choice_id: choice1.id,
            score: 1}
          ]},
        ]
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual('Votes submitted');

    // vote on survey 2, check survey 2 results
    response = await request(app)
      .post(`/surveys/${survey2.id}/votes`)
      .send({
        _token: userToken,
        votes: [
          {question_id: question2.id,
            vote_data: [
            {choice_id: choice5.id,
            score: 4},
            {choice_id: choice7.id,
            score: 3},
            {choice_id: choice6.id,
            score: 2},
            {choice_id: choice8.id,
            score: 1},
          ]}
        ]
    });

    response = await request(app)
      .get(`/surveys/${survey2.id}/votes`);

    expect(response.statusCode).toBe(200);
    expect(response.body.results).toEqual(
      [ { question_id: 2,
          vote_results:
           [ { votes: '11',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Elie Schoppik' },
             { votes: '9',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Steve Jerbs' },
             { votes: '7',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Matthew Lane' },
             { votes: '3',
               question_title: 'Favorite Bootcamp CEO',
               choice_title: 'Chill Gates' } 
            ] 
        } 
      ]
    );
  });

  it('should fail to allow a user to cast votes with questions are not in survey', async () => {
    let response = await request(app)
      .post(`/surveys/${survey1.id}/votes`)
      .send({
        _token: userToken,
        votes: [
          {question_id: question1.id,
            vote_data: [
            {choice_id: choice1.id,
            score: 1}
          ]},
          {question_id: question2.id,
            vote_data: [
            {choice_id: choice5.id,
            score: 1},
            {choice_id: choice6.id,
            score: 2},
            {choice_id: choice7.id,
            score: 3},
            {choice_id: choice8.id,
            score: 4},
          ]}
        ]
    });

    expect(response.status).toEqual(400);
    expect(response.body.error).toEqual("The votes you submitted do not pass validation");
  });
});


// describe('DELETE /surveys/:survey_id/questions/:question_id', () => {
//   it('Should delete a question', async function() {
//     // first create a new question by testUser
//     let response = await request(app)
//       .post(`/surveys/${survey3._id}/questions`)
//       .send({
//         _token: userToken,
//         title: 'TestQuestion1',
//         type: 'ranked',
//       });

//     expect(response.body).toEqual({
//       question: {
//         _id: 3,
//         _survey_id: survey3._id,
//         title: 'TestQuestion1',
//         type: 'ranked',
//         choices: []
//       },
//     });

//     const deleteResponse = await request(app)
//       .delete(`/surveys/${survey3._id}/questions/3`)
//       .send({
//         _token: userToken,
//       });

//     expect(deleteResponse.status).toEqual(200);
//     expect(deleteResponse.body).toEqual('Question Deleted');

//     const getResponse = await request(app).get(
//       `/surveys/${survey3._id}/questions/${response.body.question._id}`,
//     );

//     expect(getResponse.status).toBe(404);
//   });

//   it('Should not authorize to delete if survey for question is owned by other user', async function() {
//     // first create a new question by testUser
//     let response = await request(app)
//       .post(`/surveys/${survey3._id}/questions`)
//       .send({
//         _token: userToken,
//         title: 'TestQuestion1',
//         type: 'ranked',
//       });

//     expect(response.body).toEqual({
//       question: {
//         _id: 3,
//         _survey_id: survey3._id,
//         title: 'TestQuestion1',
//         type: 'ranked',
//         choices: []
//       },
//     });

//     // Try to delete a question whose author is "kevin" with the token for "hackerman"
//     const deleteResponse = await request(app)
//       .delete(`/surveys/${survey3.id}/questions/3`)
//       .send({
//         _token: hackerToken,
//       });

//     expect(deleteResponse.status).toEqual(401);
//     expect(deleteResponse.body.error).toEqual('Unauthorized');
//   });
// });

//Delete tables after each tets
afterEach(async function() {
  await dropTables();
});

//Close db connection
afterAll(async function() {
  await db.end();
});
