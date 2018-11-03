db = require('../db');

async function createTables() {
  //adding surveys and related users for those surveys to test
  //build up our test tables
  await db.query(`
    CREATE TABLE users
    (
      username text PRIMARY KEY,
      password text NOT NULL,
      email text NOT NULL UNIQUE,
      first_name text NOT NULL,
      last_name text NOT NULL,
      photo_url text DEFAULT 'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg',
      is_admin boolean NOT NULL default false
    )
  `)
  await db.query(`      
    CREATE TABLE surveys
    (
      id SERIAL PRIMARY KEY,
      author text REFERENCES users ON DELETE cascade,
      title text NOT NULL UNIQUE,
      description text,
      anonymous boolean NOT NULL default true,
      date_posted TIMESTAMP default CURRENT_TIMESTAMP
    )
  `)
  await db.query(`
    CREATE TABLE questions
    (
      id SERIAL PRIMARY KEY,
      survey_id integer REFERENCES surveys ON DELETE cascade,
      type text NOT NULL,
      title text NOT NULL
    )
  `)
  await db.query(`
    CREATE TABLE choices
    (
      id SERIAL PRIMARY KEY,
      question_id integer REFERENCES questions ON DELETE cascade,
      content text,
      title text NOT NULL
    )
  `)
  await db.query(`
    CREATE TABLE votes
    (
      choice_id integer NOT NULL REFERENCES choices ON DELETE cascade,
      question_id integer NOT NULL REFERENCES questions ON DELETE cascade,
      survey_id integer NOT NULL REFERENCES surveys ON DELETE cascade,
      user_id text NOT NULL REFERENCES users ON DELETE cascade,
      PRIMARY KEY (choice_id, question_id, survey_id, user_id),
      score integer NOT NULL
    )
  `)
}

async function insertTestData() {
  let result1 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('joerocket', 'testpass', 'joe', 'smith', 'joe@gmail.com', True)
  RETURNING username, first_name, last_name, email, photo_url, is_admin
  `);
  let result2 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('spongebob', 'garry', 'SpongeBob', 'SquarePants', 'sponge@gmail.com', False)
  RETURNING username, first_name, last_name, email, photo_url, is_admin
  `);
  let result3 = await db.query(`
  INSERT INTO surveys (author, title, description)
  VALUES ('joerocket', 'best albums of 2009', 'hot fiya')
  RETURNING id, author, title, description, anonymous, date_posted
  `);
  let result4 = await db.query(`
  INSERT INTO surveys (author, title, description)
  VALUES ('spongebob','top ceos','top ceos of all time')
  RETURNING id, author, title, description, anonymous, date_posted
  `);

  const user1 = result1.rows[0];
  const user2 = result2.rows[0];
  const survey1 = result3.rows[0];
  const survey2 = result4.rows[0];

  let result5 = await db.query(`
  INSERT INTO questions (title, type, survey_id)
  VALUES ('Favorite EDM Artist','multiple choice', $1)
  RETURNING id, title, type, survey_id
  `, [survey1.id]);

  let result6 = await db.query(`
  INSERT INTO questions (title, type, survey_id)
  VALUES ('Favorite Bootcamp CEO','multiple choice', $1)
  RETURNING id, title, type, survey_id
  `, [survey2.id]);

  const question1 = result5.rows[0];
  const question2 = result6.rows[0];

  // Setup 4 choices per question as test

  // 4 choices for favorite EDM artists

  let result7 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Bassnectar-Test-Youtube-Link.html', 'Bassnectar')
  RETURNING id, question_id, content, title
  `,
    [question1.id,]
  );

  let result8 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Tiesto-Youtube-Link.html', 'Tiesto')
  RETURNING id, question_id, content, title
  `,
    [question1.id,]
  );

  let result9 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Beats-Antique-Youtube-Link.html', 'Beats Antique')
  RETURNING id, question_id, content, title
  `,
    [question1.id,]
  );

  let result10 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Slugabed-Youtube-Link.html', 'Slugabed')
  RETURNING id, question_id, content, title
  `,
    [question1.id,]
  );

  const choice1 = result7.rows[0];
  const choice2 = result8.rows[0];
  const choice3 = result9.rows[0];
  const choice4 = result10.rows[0];

  // 4 choices for top bootcamp school ceo

  let result11 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Elie-CEO.html', 'Elie Schoppik')
  RETURNING id, question_id, content, title
  `,
    [question2.id,]
  );

  let result12 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Matt-CEO.html', 'Matthew Lane')
  RETURNING id, question_id, content, title
  `,
    [question2.id,]
  );

  let result13 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Steve-Jerbs-CEO.html', 'Steve Jerbs')
  RETURNING id, question_id, content, title
  `,
    [question2.id,]
  );

  let result14 = await db.query(
    `
  INSERT INTO choices (question_id, content, title)
  VALUES ($1, 'Chill-Gates-CEO.html', 'Chill Gates')
  RETURNING id, question_id, content, title
  `,
    [question2.id,]
  );

  const choice5 = result11.rows[0];
  const choice6 = result12.rows[0];
  const choice7 = result13.rows[0];
  const choice8 = result14.rows[0];

  return {
    survey1,
    survey2,
    question1,
    question2,
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
  };
}

async function dropTables() {
  await db.query(`DROP TABLE votes`);
  await db.query(`DROP TABLE choices`);
  await db.query(`DROP TABLE questions`);
  await db.query(`DROP TABLE surveys`);
  await db.query(`DROP TABLE users`);
}

module.exports = {
  createTables,
  insertTestData,
  dropTables
};
