process.env.NODE_ENV = 'test';
const Question = require('../../models/question');
const db = require('../../db');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');

let survey1, survey2, question1;
// Insert 2 questions before each test
beforeEach(async function () {
  // Build up our test tables and return inserted test questions, surveys and users
  await createTables();
  ({ question1, question2, survey1, survey2, user1, user2 } = await insertTestData());
});

// Test getting all questions by a survey_id
describe('get()', () => {
  it('should correctly return a list of questions', async function () {
    const questions = await Question.getAll({ db }, { survey_id: survey1.id });

    // Check that returned structure matches this exactly
    expect(questions).toEqual([
      {
        _id: question1.id,
        title: question1.title,
        question_type: question1.question_type,
        _survey_id: question1.survey_id,
        db,
      }
    ]);
  });
});

//Test creating question
describe('create()', () => {
  it('should correctly add a question', async function () {
    await Question.create({ db }, {
      title: 'Favorite Millenial CEO',
      question_type: 'Multiple Choice',
      survey_id: survey2.id,
    });

    const questions = await Question.getAll({ db }, { survey_id: survey2.id });
    expect(questions.length).toEqual(2);
  });

  it('Should fail to add a question if title is missing', async function () {
    try {
      await Question.create({ db }, {
        question_type: 'Multiple Choice',
        survey_id: survey2.id,
      });
      throw new Error();
    } catch(e) {
      expect(e.message).toMatch(`Must supply title, question_type and survey_id`);
    }
  });
});

//Test get one question
describe('get()', () => {
  it('should correctly return a question by id', async function () {
    const question = await Question.get({ db }, { id: question1.id });
    expect(question.id).toEqual(question1.id);
    expect(question.question_type).toEqual(question1.question_type);

    //get a question that doesn't exist and check failure
    try {
      await Question.get({ db }, { id: -30 });
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Cannot find question by id: -30`);
    }
  });
});

//Update a question test
describe('updateQuestion()', () => {
  it('should correctly update a question', async function () {
    let question = await Question.get({ db }, { id: question1.id });
    question.title = 'Favorite Trance Artist';

    await question.save();
    question = await Question.get({ db }, {id: question1.id });
    expect(question.title).toEqual('Favorite Trance Artist');

    const questions = await Question.getAll({ db }, { survey_id: survey1.id });
    expect(questions.length).toEqual(1);

    expect(() => {
      question.id = 'THISSHOULDFAIL';
    }).toThrowError(`Can't change id!`);

    expect(() => {
      question.survey_id = 'THISSHOULDFAIL';
    }).toThrowError(`Can't change survey id!`);
  });

  it('should fail to update a non-existent question', async function () {
    let question = new Question({
      id: 987, 
      title: 'blah', 
      content_type: 'multiple',
      db,
    });
    
    try {
      question.title = "nice-buns";
      await question.save();
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Cannot find question to update`);
    }
  });
});

//Delete a question test
describe('deleteQuestion()', () => {
  it('should correctly delete a question', async function () {
    const questionToBeDeleted = await Question.get({ db }, { id: question1.id });
    const message = await questionToBeDeleted.delete();
    expect(message).toBe('Question Deleted');
  });
});

//Delete questions after each tets
afterEach(async function () {
  await dropTables();
});

//Close db connection
afterAll(async function () {
  await db.end();
});
