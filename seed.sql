-- Insert test users
INSERT INTO users (username, password, email, first_name, last_name)
VALUES ('admin', 'admin', 'admin@admin.com', 'admin','administrator');

INSERT INTO users (username, password, email, first_name, last_name)
VALUES ('testuser', 'password', 'test@test.com', 'test', 'user');

-- Insert test surveys
INSERT INTO surveys (author, title, published)
VALUES ('admin', 'Test survey 1', True);

INSERT INTO surveys (author, title, description, published)
VALUES ('testuser', 'This survey has a description', 'This is a just a test', True);

-- Insert test questions
INSERT INTO questions (survey_id, question_type, title)
VALUES (1, 'multiple', 'first question');

INSERT INTO questions (survey_id, question_type, title)
VALUES (1, 'multiple', 'second question');

-- Insert test choices
INSERT INTO choices (question_id, content, content_type, title)
VALUES (1, 'CONTENT HERE', 'type', 'selection number 1');

INSERT INTO choices (question_id, content, content_type, title)
VALUES (1, 'CONTENT HERE', 'type', 'selection number 2');

INSERT INTO choices (question_id, content, content_type, title)
VALUES (2, 'CONTENT HERE', 'type', 'selection number 1');

INSERT INTO choices (question_id, content, content_type, title)
VALUES (2, 'CONTENT HERE', 'type', 'selection number 2');

-- Insert test votes
INSERT INTO votes (choice_id, username, score)
VALUES (1, 'admin', 1);

INSERT INTO votes (choice_id, username, score)
VALUES (2, 'admin', 1);

INSERT INTO votes (choice_id, username, score)
VALUES (3, 'admin', 1);

INSERT INTO votes (choice_id, username, score)
VALUES (4, 'admin', 1);

INSERT INTO votes (choice_id, username, score)
VALUES (1, 'testuser', 1);

INSERT INTO votes (choice_id, username, score)
VALUES (4, 'testuser', 1);
