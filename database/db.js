const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const schema = require('./schema');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Neon serverless HTTP driver — no persistent connection to manage, ideal for
// Vercel serverless functions. Each query is a stateless HTTPS request.
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

module.exports = { db, schema };
