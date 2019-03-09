process.env.NODE_ENV = 'test';
const Vote = require('../../models/vote');
const db = require('../../db');
const deps = require('../../dep_container/IoC');
const {
  createTables,
  insertTestData,
  dropTables,
} = require('../../test_helpers/setup');

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

  let userResult = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('UrpleEeple', 'peter', 'peter', 'farr', 'peter@gmail.com', False)
  RETURNING username, first_name, last_name, email, photo_url, is_admin
  `);

  user3 = userResult.rows[0];
});

describe('Setters/Getters testing', () => {
  it('should deny directly changing choice_id', async function() {
    try {
      const vote = await Vote.create(deps, {
        username: user3.username,
        choice_id: choice3.id,
        score: 1,
      });
      vote.choice_id = 5;
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(
        `Can't change choice_id!`,
      );
    }
  });

  it('should deny directly changing username', async function() {
    try {
      const vote = await Vote.create(deps, {
        username: user3.username,
        choice_id: choice3.id,
        score: 1,
      });
      vote.username = "fred";
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(
        `Can't change user id!`,
      );
    }
  });
});

// Test getting all votes by a question_id
describe('getAll()', () => {
  it('should correctly return a list of votes', async function() {
    const votes = await Vote.getAll(deps, { question_id: question1.id });

    //Check that returned structure matches this exactly
    expect(votes).toEqual([
      {
        votes: '2',
        question_title: 'Favorite EDM Artist',
        choice_title: 'Beats Antique',
      },
    ]);

    //Check that ranked voting matches up correctly

    const votes2 = await Vote.getAll(deps, { question_id: question2.id });
    // check ranked voting matches scoring we would expect
    expect(votes2).toEqual([
      {
        votes: '7',
        question_title: 'Favorite Bootcamp CEO',
        choice_title: 'Elie Schoppik',
      },
      {
        votes: '6',
        question_title: 'Favorite Bootcamp CEO',
        choice_title: 'Steve Jerbs',
      },
      {
        votes: '5',
        question_title: 'Favorite Bootcamp CEO',
        choice_title: 'Matthew Lane',
      },
      {
        votes: '2',
        question_title: 'Favorite Bootcamp CEO',
        choice_title: 'Chill Gates',
      },
    ]);
  });
});

//Test creating vote
describe('create()', () => {
  it('should correctly add a vote', async function() {
    const newVote = await Vote.create(deps, {
      username: user3.username,
      choice_id: choice3.id,
      score: 1,
    });

    const votes = await Vote.getAll(deps, {question_id: question1.id});
    expect(votes[0].votes).toEqual('3');
  });

  it('should fail to add a vote with no score', async function() {
    try {
      const badVote = await Vote.create(deps, {
        username: user3.username,
        choice_id: choice3.id,
      });
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(
        `Missing parameters`,
      );
    }
  });
});

//Test get one vote
describe('get()', () => {
  it('should correctly return a vote by composite key', async function() {
    const {question_id, survey_id, username, choice_id} = vote1;
    const vote = await Vote.get(deps, {question_id, survey_id, username, choice_id});
    expect(vote.score).toEqual(vote1.score);

    //get a vote that doesn't exist and check failure
    try {
      const junkData = {question_id, survey_id, username, choice_id: -30}
      await Vote.get(deps, junkData);
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Cannot find vote`);
    }
  });

  it('should throw an error if we are missing either username or choice_id', async function() {
    try {
      const {question_id, survey_id, username, choice_id} = vote1;
      const vote = await Vote.get(deps, {question_id, survey_id, choice_id});
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch(`Missing parameters`);
    }
    
  });
});

//Delete a vote test
describe('deleteVote()', () => {
  it('should correctly delete a vote', async function() {
    const voteToBeDeleted = await Vote.get(deps, vote1);
    const message = await voteToBeDeleted.delete();
    expect(message).toBe('Vote Removed');
  });

  it('should fail to delete a vote that does not exist', async function() {
    try {
      const fakeVote = new Vote({choice_id: 50, username: "bob", score: 5, db});
      const message = await fakeVote.delete();
    } catch (e) {
      expect(e.message).toMatch(`Could not delete vote`);
    }
  });
});

//Delete votes after each tets
afterEach(async function() {
  await dropTables();
});

//Close db connection
afterAll(async function() {
  await db.end();
});
