process.env.NODE_ENV = 'test';
const Survey = require('../../models/survey');
const db = require('../../db');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');


let survey1, survey2, question1, question2, user1, user2;

// Insert 2 users before each test
beforeEach(async function () {
  // Build up our test tables and return inserted test questions, surveys and users
  await createTables();
  ({
    question1,
    question2,
    survey1,
    survey2,
    user1,
    user2
  } = await insertTestData());

});

// Test get filtered users
describe('getSurvey(id)', () => {
  it('should get a survey by id', async function () {
    const survey = await Survey.getOne(survey1.id);
    expect(survey).toEqual({
      _id: expect.any(Number),
      anonymous: true,
      author: "joerocket",
      date_posted: expect.any(Date),
      description: "hot fiya",
      title: "best albums of 2009",
    });
  });

  it('should throw error if use not found', async function () {

    try {
      const response = await Survey.getOne(3456);
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.message).toEqual('Not Found');
    }
  });
});


describe('getSurveys()', () => {
  it('should get a list of surveys with no filter queries', async function () {
    const surveys = await Survey.getAll();

    expect(surveys.length).toEqual(2);
    expect(surveys[0]).toEqual({
      "_id": 1,
      "anonymous": true,
      "author": survey1.author,
      "date_posted": expect.any(Date),
      "description": survey1.description,
      "title": survey1.title
    });
    expect(surveys[1]).toEqual({
      "_id": expect.any(Number),
      "anonymous": true,
      "author": survey2.author,
      "date_posted": expect.any(Date),
      "description": survey2.description,
      "title": survey2.title
    });
  });
});


describe('createSurvey(author, title, description)', () => {
  it('should create a new survey with author, title, and description', async function () {
    const newSurvey = {
      author: user1.username,
      title: "How do you like your drink mixed?",
      description: "Shaken or Stirred. Which will it be?"
    }

    const survey = await Survey.create(newSurvey.author, newSurvey.title, newSurvey.description)

    expect(survey).toEqual({
      _id: expect.any(Number),
      author: newSurvey.author,
      title: newSurvey.title,
      description: newSurvey.description,
      date_posted: expect.any(Date),
      anonymous: true
    })
  });

  it('should create a new survey with a null description', async function () {
    const newSurvey = {
      author: user1.username,
      title: "How do you like your drink mixed?",
    }

    const survey = await Survey.create(newSurvey.author, newSurvey.title)

    expect(survey).toEqual({
      _id: expect.any(Number),
      author: newSurvey.author,
      title: newSurvey.title,
      description: null,
      date_posted: expect.any(Date),
      anonymous: true
    })
  });

  it('should return throw error if fields missing', async function () {
    const newSurvey = {
      author: user1.username,
    }
    try {
      const response = await Survey.create(newSurvey.author)
    } catch (err) {
      expect(err.message).toEqual('Missing author or title parameter')
    }
  });
});


describe('updateSurvey(id, title, description, anonymous)', async function () {
  it('should update a survey with all fields', async function () {
    let survey = await Survey.getOne(survey1.id);

    survey.description = 'new description';
    survey.title = 'New Title';
    survey.anonymous = false;

    await survey.save();

    survey = await Survey.getOne(survey1.id);

    expect(survey).toEqual({
      _id: survey1.id,
      author: survey1.author,
      title: 'New Title',
      description: 'new description',
      date_posted: survey1.date_posted,
      anonymous: false
    })
  });

  it('should update a survey with one field', async function () {
    let survey = await Survey.getOne(survey1.id);

    survey.description = 'new description';

    await survey.save();

    survey = await Survey.getOne(survey1.id);

    expect(survey).toEqual({
      _id: survey1.id,
      author: survey1.author,
      title: survey1.title,
      description: 'new description',
      date_posted: survey1.date_posted,
      anonymous: survey1.anonymous
    });
  });

  it('should throw not change an restricted field', async function () {
    let survey = await Survey.getOne(survey1.id);

    survey.author = "NewAuthor";
    survey.date_posted = Date.now();

    await survey.save();

    survey = await Survey.getOne(survey1.id);

    expect(survey).toEqual({
      _id: survey1.id,
      author: survey1.author,
      title: survey1.title,
      description: survey1.description,
      date_posted: survey1.date_posted,
      anonymous: survey1.anonymous
    });
  })
});


describe('deleteSurvey(id)', () => {
  it('should delete a survey by id', async function () {
    let survey = await Survey.getOne(survey1.id);
    survey.delete();
    try {
      survey = await Survey.getOne(survey1.id);
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.message).toEqual('Not Found');
    }
  });
});


// Delete all tables after each tets
afterEach(async function () {
  await dropTables();
});

// Close db connection
afterAll(async function () {
  await db.end();
});