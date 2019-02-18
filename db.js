/** Database setup for libellis. */

const { Pool } = require("pg");
const { DB_URI } = require("./config");
const url = require('url');

const params = url.parse(DB_URI);
const [user, password] = params.auth.split(':');
const database = params.pathname.slice(1);
const host = params.hostname;

const pool = new Pool({
  database,
  user,
  password,
  port: 5432,
  ssl: false,
  max: 30,
  min: 10,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
