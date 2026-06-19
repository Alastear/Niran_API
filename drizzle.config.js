require('dotenv').config();

/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './database/schema.js',
  out: './database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
