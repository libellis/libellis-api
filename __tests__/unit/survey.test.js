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

describe('Setters/Getters testing', () => {
  it('should deny directly changing id', async function () {
    try {
      let survey = await Survey.create({ db }, {
        author: user2.username,
        title: "What's your favorite kind of chocolate?",
        description: "Dark or Milk?",
        category: "music"
      });
      survey.id = 25;
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(
        `Can't change id!`,
      );
    }
  });
});

// Test get filtered users
describe('get(id)', () => {
  it('should get a survey by id', async function () {
    const survey = await Survey.get({ db }, { id: survey1.id });
    expect(survey).toEqual({
      _id: expect.any(Number),
      published: false,
      anonymous: true,
      author: "joerocket",
      category: survey1.category,
      date_posted: expect.any(Date),
      description: "hot fiya",
      title: "best albums of 2009",
      db,
    });
  });

  it('should throw error if use not found', async function () {
    try {
      const response = await Survey.get({ db }, { id: 3456 });
      throw new Error();
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.message).toEqual('Not Found');
    }
  });

  it('should throw error if id supplied is falsy', async function () {
    try {
      const response = await Survey.get({ db }, { id: undefined });
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Missing id parameter`);
    }
  });
});


describe('getAll()', () => {
  it('should get a list of surveys with no filter queries', async function () {
    const surveys = await Survey.getAll({ db }, { search: '' });

    expect(surveys.length).toEqual(0);


    let survey_result = await db.query(`
    INSERT INTO surveys (author, title, description, published, category)
    VALUES ('joerocket', 'Best Books Ever', 'J.k rowling aint got shit on this', true, 'music')
    RETURNING id, author, title, description, anonymous, date_posted, category
  `);

    let survey3 = survey_result.rows[0];

    let surveys2 = await Survey.getAll({ db }, { search: '' });

    expect(surveys2[0]).toEqual({
      "_id": 3,
      "published": true,
      "anonymous": true,
      "author": survey3.author,
      "date_posted": expect.any(Date),
      "description": survey3.description,
      "category": survey3.category,
      "title": survey3.title,
      db,
    });
  });

  it('should be able to search for a survey', async function () {
    const surveys = await Survey.getAll({ db }, { search: survey1.author });

    expect(surveys.length).toEqual(1);
    expect(surveys[0]).toEqual({
      "_id": 1,
      "published": false,
      "anonymous": true,
      "author": survey1.author,
      "date_posted": expect.any(Date),
      "description": survey1.description,
      "category": survey1.category,
      "title": survey1.title,
      db,
    });
  });
});


/** get surveys by user is handled by User model, so this is commented out */

// describe('getForUser()', () => {
//   it('should return an array of surveys created by given username', async function () {
//     const surveys = await Survey.getForUser(survey2.author);
//     expect(surveys[0]).toEqual({
//       "_id": 2, 
//       "anonymous": true, 
//       "author": "spongebob", 
//       "date_posted": expect.any(Date), 
//       "description": "top ceos of all time", 
//       "published": false, 
//       "title": "top ceos"
//     });
//   }); 

//   it('should be able to search for a survey', async function () {
//     const surveys = await Survey.getAll(survey1.author);
//     expect(surveys.length).toEqual(1);
//     expect(surveys[0]).toEqual({
//       "_id": 1,
//       published: false,
//       "anonymous": true,
//       "author": survey1.author,
//       "date_posted": expect.any(Date),
//       "description": survey1.description,
//       "title": survey1.title
//     });
//   });
// });



describe('create(author, title, description)', () => {
  it('should create a new survey with author, title, and description', async function () {
    const newSurvey = {
      author: user1.username,
      title: "How do you like your drink mixed?",
      description: "Shaken or Stirred. Which will it be?",
      category: "music",
    }

    const survey = await Survey.create({ db }, newSurvey);

    expect(survey).toEqual({
      _id: expect.any(Number),
      published: false,
      author: newSurvey.author,
      title: newSurvey.title,
      description: newSurvey.description,
      category: newSurvey.category,
      date_posted: expect.any(Date),
      anonymous: true,
      db,
    })
  });

  it('should create a new survey with a null description', async function () {
    const newSurvey = {
      author: user1.username,
      title: "How do you like your drink mixed?",
      category: "music",
    }

    const survey = await Survey.create({ db }, newSurvey)

    expect(survey).toEqual({
      _id: expect.any(Number),
      published: false,
      author: newSurvey.author,
      title: newSurvey.title,
      category: newSurvey.category,
      description: null,
      date_posted: expect.any(Date),
      anonymous: true,
      db,
    })
  });

  it('should return throw error if fields missing', async function () {
    const newSurvey = {
      author: user1.username,
    }
    try {
      const response = await Survey.create({ db }, newSurvey)
    } catch (err) {
      expect(err.message).toEqual('Missing author or title parameter')
    }
  });
});


describe('save(id, title, description, anonymous)', async function () {
  it('should update a survey with all fields', async function () {
    let survey = await Survey.get({ db }, { id: survey1.id });

    survey.description = 'new description';
    survey.title = 'New Title';
    survey.anonymous = false;

    await survey.save();

    survey = await Survey.get({ db }, { id: survey1.id });

    expect(survey).toEqual({
      _id: survey1.id,
      published: false,
      author: survey1.author,
      title: 'New Title',
      description: 'new description',
      category: survey1.category,
      date_posted: survey1.date_posted,
      anonymous: false,
      db,
    })
  });

  it('should update a survey with one field', async function () {
    let survey = await Survey.get({ db }, { id: survey1.id });

    survey.description = 'new description';

    await survey.save();

    survey = await Survey.get({ db }, { id: survey1.id });

    expect(survey).toEqual({
      _id: survey1.id,
      published: false,
      author: survey1.author,
      title: survey1.title,
      description: 'new description',
      category: survey1.category,
      date_posted: survey1.date_posted,
      anonymous: survey1.anonymous,
      db,
    });
  });

  it('should update a survey to published state', async function () {
    let survey = await Survey.get({ db }, { id: survey1.id });

    // should update all save checks to use this!
    survey.updateFromValues({ published: true });

    await survey.save();

    survey = await Survey.get({ db }, { id: survey1.id });

    expect(survey).toEqual({
      _id: survey1.id,
      published: true,
      author: survey1.author,
      title: survey1.title,
      description: survey1.description,
      category: survey1.category,
      date_posted: survey1.date_posted,
      anonymous: survey1.anonymous,
      db,
    });
  });

  it('should throw not change an restricted field', async function () {
    let survey = await Survey.get({ db }, { id: survey1.id });

    survey.author = "NewAuthor";
    survey.date_posted = Date.now();

    await survey.save();

    survey = await Survey.get({ db }, { id: survey1.id });

    expect(survey).toEqual({
      _id: survey1.id,
      published: false,
      author: survey1.author,
      title: survey1.title,
      description: survey1.description,
      category: survey1.category,
      date_posted: survey1.date_posted,
      anonymous: survey1.anonymous,
      db,
    });
  })

  it('should fail to update a non-existent survey', async function () {
    let survey = new Survey({
      id: 987,
      title: 'faketitle',
      description: 'fakedescription',
      author: 'fakeauthor',
      date_posted: Date.now(),
      anonymous: true,
      published: true,
      db,
    });

    try {
      survey.title = "nice-buns";
      await survey.save();
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Cannot find survey to update`);
    }
  });
});


describe('delete(id)', () => {
  it('should delete a survey by id', async function () {
    let survey = await Survey.get({ db }, { id: survey1.id });
    survey.delete();
    try {
      survey = await Survey.get({ db }, { id: survey1.id });
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.message).toEqual('Not Found');
    }
  });

  it('should fail to delete a survey that does not exist', async function () {
    try {
      let fakeSurvey = new Survey({
        id: 987,
        title: 'faketitle',
        description: 'fakedescription',
        author: 'fakeauthor',
        date_posted: Date.now(),
        anonymous: true,
        published: true,
        db,
      });
      const message = await fakeSurvey.delete();
    } catch (e) {
      expect(e.message).toMatch(`Could not delete survey: 987`);
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
