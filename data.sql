CREATE TABLE users
(
  username text PRIMARY KEY,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  photo_url text
    DEFAULT 'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg',
  is_admin boolean NOT NULL default false
);

CREATE TABLE surveys
(
  id SERIAL PRIMARY KEY,
  author text REFERENCES users ON DELETE cascade,
  title text NOT NULL UNIQUE,
  description text,
  anonymous boolean NOT NULL default true,
  date_posted TIMESTAMP default CURRENT_TIMESTAMP
);

CREATE TABLE questions
(
  id SERIAL PRIMARY KEY,
  survey_id integer REFERENCES surveys ON DELETE cascade,
  type text NOT NULL,
  title text NOT NULL
);

CREATE TABLE choices
(
  id SERIAL PRIMARY KEY,
  question_id integer REFERENCES questions ON DELETE cascade,
  content text,
  title text NOT NULL
);

CREATE TABLE votes
(
  choice_id integer NOT NULL REFERENCES choices,
  question_id integer NOT NULL REFERENCES questions,
  survey_id integer NOT NULL REFERENCES surveys,
  user_id text NOT NULL REFERENCES users,
  PRIMARY KEY (choice_id, question_id, survey_id, user_id),
  score integer NOT NULL
);