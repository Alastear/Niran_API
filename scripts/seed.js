require('dotenv').config();
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
const { db, schema } = require('../database/db');

// Bootstraps the first ADMIN user. The /api/admin/register route is itself
// admin-protected, so this script is how you create the very first admin.
//
// Usage:
//   SEED_ADMIN_USER=admin SEED_ADMIN_PASS=secret123 npm run seed

async function main() {
  const username = process.env.SEED_ADMIN_USER || 'admin';
  const password = process.env.SEED_ADMIN_PASS || 'admin1234';

  const [existing] = await db.select().from(schema.users).where(eq(schema.users.username, username));
  if (existing) {
    console.log(`User "${username}" already exists (id=${existing._id}). Nothing to do.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const date = new Date();
  const [user] = await db.insert(schema.users).values({
    username,
    password: hashed,
    position: 'ADMIN',
    createDate: date,
    updateDate: date,
  }).returning();

  console.log(`Created ADMIN user "${user.username}" (id=${user._id}).`);
  console.log('Login at POST /api/user/login with the username/password you set.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
