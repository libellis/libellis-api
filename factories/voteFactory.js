const Vote = require('../models/vote');

/*
 * Create a vote in database
 */
async function voteFactory(data) {
  const { choice_id, username, score } = data;

  let result = await db.query(
    `
    INSERT INTO votes (choice_id, username, score)
    VALUES ($1, $2, $3)
    RETURNING id, choice_id, username, score
    `,
    [choice_id, user, score]
  );

  const vote = result.rows[0];
  return vote;
}
