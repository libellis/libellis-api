/** Shared config for application; can be req'd many places. */

require('dotenv').config();

const SECRET = process.env.SECRET_KEY || 'test';
const BWF = process.env.BWF || 10;

const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'libellis-test'
// - else: 'libellis'

let DB_URI;

if (process.env.NODE_ENV === 'test') {
  DB_URI = 'libellis-test';
} else {
  DB_URI = process.env.DATABASE_URL || 'libellis';
}

module.exports = {
  SECRET,
  PORT,
  DB_URI,
  BWF
};