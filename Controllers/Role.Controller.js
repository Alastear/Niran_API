const createError = require('http-errors');
const { eq } = require('drizzle-orm');
const { db, schema } = require('../database/db');
const { PERMISSION_GROUPS, ALL_PERMISSIONS } = require('../config/permissions');

const Roles = schema.roles;

// เก็บเฉพาะ permission key ที่มีอยู่จริงใน catalog (กันค่ามั่ว)
const sanitize = (perms) =>
  Array.isArray(perms) ? perms.filter((p) => ALL_PERMISSIONS.includes(p)) : [];

module.exports = {
  // รายการสิทธิ์ทั้งหมด (ให้ FE เรนเดอร์ checkbox)
  get_permission_catalog: async (req, res, next) => {
    try {
      res.send(PERMISSION_GROUPS);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  get_all_roles: async (req, res, next) => {
    try {
      const results = await db.select().from(Roles).orderBy(Roles._id);
      res.send(results);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  create_role: async (req, res, next) => {
    try {
      const body = req.body;
      if (!body.name) return next(createError(422, 'name is required'));
      const [result] = await db.insert(Roles).values({
        name: body.name,
        permissions: sanitize(body.permissions),
        is_system: false,
        updateDate: new Date(),
      }).returning();
      res.send(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  update_role: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return next(createError(400, 'Invalid role id'));
      const [existing] = await db.select().from(Roles).where(eq(Roles._id, id));
      if (!existing) return next(createError(404, 'Role not found'));

      const body = req.body;
      const updates = { updateDate: new Date() };
      // role ระบบ (เจ้าของ) แก้ชื่อได้ แต่ล็อกสิทธิ์ไว้เต็มเสมอ (กันล็อกตัวเอง)
      if (body.name !== undefined) updates.name = body.name;
      if (body.permissions !== undefined) {
        updates.permissions = existing.is_system ? ALL_PERMISSIONS : sanitize(body.permissions);
      }
      const [result] = await db.update(Roles).set(updates).where(eq(Roles._id, id)).returning();
      res.send(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  delete_role: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return next(createError(400, 'Invalid role id'));
      const [existing] = await db.select().from(Roles).where(eq(Roles._id, id));
      if (!existing) return next(createError(404, 'Role not found'));
      if (existing.is_system) return next(createError(400, 'ลบ role ระบบไม่ได้'));

      // กันลบ role ที่ยังมี user ใช้อยู่
      const [inUse] = await db.select().from(schema.users).where(eq(schema.users.role_id, id));
      if (inUse) return next(createError(400, 'ยังมีผู้ใช้อยู่ใน role นี้ ย้าย role ก่อนลบ'));

      const [result] = await db.delete(Roles).where(eq(Roles._id, id)).returning();
      res.send(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
};
