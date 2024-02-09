require('dotenv').config();

const { Pool } = require('pg');
const pool = new Pool({
  user: 'cookecd1',
  host: 'localhost',
  database: 'fridge',
  password: '',
  port: 5432,
});

module.exports = pool;