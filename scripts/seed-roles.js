require('dotenv').config();
const { eq } = require('drizzle-orm');
const { db, schema } = require('../database/db');
const { DEFAULT_ROLES } = require('../config/permissions');

async function main() {
  const date = new Date();
  const existing = await db.select().from(schema.roles);
  const byName = new Map(existing.map((r) => [r.name, r]));

  let ownerId = null;
  for (const r of DEFAULT_ROLES) {
    let row = byName.get(r.name);
    if (row) {
      console.log(`role "${r.name}" มีอยู่แล้ว (id=${row._id})`);
    } else {
      [row] = await db.insert(schema.roles).values({
        name: r.name,
        permissions: r.permissions,
        is_system: r.is_system,
        updateDate: date,
      }).returning();
      console.log(`+ สร้าง role "${r.name}" (id=${row._id}) — ${r.permissions.length} สิทธิ์`);
    }
    if (r.name === 'เจ้าของ') ownerId = row._id;
  }

  // ผู้ใช้ ADMIN ที่ยังไม่มี role → ให้เป็นเจ้าของ
  if (ownerId) {
    const admins = await db.select().from(schema.users).where(eq(schema.users.position, 'ADMIN'));
    for (const u of admins) {
      if (!u.role_id) {
        await db.update(schema.users).set({ role_id: ownerId, updateDate: date }).where(eq(schema.users._id, u._id));
        console.log(`ตั้ง user "${u.username}" → role เจ้าของ`);
      }
    }
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
