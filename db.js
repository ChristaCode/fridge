require('dotenv').config();

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: isProduction ? process.env.PROD_DB_USER : 'cookecd1',
  host: isProduction ? process.env.PROD_DB_HOST : 'localhost',
  database: isProduction ? process.env.PROD_DB_NAME : 'fridge',
  password: isProduction ? process.env.PROD_DB_PASSWORD : '',
  port: isProduction ? process.env.PROD_DB_PORT : 5432,
  // If in production, use DATABASE_URL (commonly provided by Heroku)
  connectionString: isProduction ? process.env.DATABASE_URL : null,
  // Use SSL in production. Important for connecting to Heroku Postgres
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;