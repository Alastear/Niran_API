const createError = require('http-errors');
const { eq, desc } = require('drizzle-orm');
const { db, schema } = require('../database/db');

const Customers = schema.customers;

const toDate = (v) => (v ? new Date(v) : null);

function buildValues(body) {
  const v = {};
  for (const k of ['name', 'tel', 'email', 'note', 'status', 'source']) if (body[k] !== undefined) v[k] = body[k];
  if (body.car_id !== undefined) v.car_id = body.car_id === '' || body.car_id === null ? null : Number(body.car_id);
  if (body.insurance_expiry !== undefined) v.insurance_expiry = toDate(body.insurance_expiry);
  if (body.next_service_date !== undefined) v.next_service_date = toDate(body.next_service_date);
  return v;
}

module.exports = {
  Customer_Api: {
    get_all_customer: async (req, res, next) => {
      try {
        const rows = await db.select().from(Customers).orderBy(desc(Customers._id));
        res.send(rows);
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    },

    create_customer: async (req, res, next) => {
      try {
        if (!req.body.name) return next(createError(422, 'name is required'));
        const date = new Date();
        const [row] = await db.insert(Customers).values({ ...buildValues(req.body), createDate: date, updateDate: date }).returning();
        res.send(row);
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    },

    update_customer: async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return next(createError(400, 'Invalid customer id'));
        const [row] = await db.update(Customers).set({ ...buildValues(req.body), updateDate: new Date() }).where(eq(Customers._id, id)).returning();
        if (!row) return next(createError(404, 'Customer not found'));
        res.send(row);
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    },

    delete_customer: async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return next(createError(400, 'Invalid customer id'));
        const [row] = await db.delete(Customers).where(eq(Customers._id, id)).returning();
        if (!row) return next(createError(404, 'Customer not found'));
        res.send({ status: 'success', _id: id });
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    },
  },

  // Public: ฟอร์มสนใจรถจากหน้าเว็บ → สร้าง lead ใน CRM (ไม่ต้อง login)
  create_inquiry: async (req, res, next) => {
    try {
      const b = req.body || {};
      if (!b.name && !b.tel) return next(createError(422, 'ต้องมีชื่อหรือเบอร์โทร'));
      const date = new Date();
      const noteParts = [];
      if (b.car_title) noteParts.push(`สนใจรถ: ${b.car_title}`);
      if (b.message) noteParts.push(b.message);
      const [row] = await db.insert(Customers).values({
        name: b.name || '(ไม่ระบุชื่อ)',
        tel: b.tel || null,
        email: b.email || null,
        note: noteParts.join(' | ') || null,
        car_id: b.car_id ? Number(b.car_id) : null,
        status: 'interested',
        source: 'website',
        createDate: date,
        updateDate: date,
      }).returning();
      res.send({ status: 'success', _id: row._id });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  // Alert Center: รวมสิ่งที่ใกล้ครบกำหนด (ภาษีรถ / ประกัน / เช็คระยะ) ภายใน N วัน (รวมที่เลยกำหนดแล้ว)
  get_alerts: async (req, res, next) => {
    try {
      const days = Number(req.query.days) || 30;
      const now = new Date();
      const daysLeft = (d) => (d ? Math.ceil((new Date(d).getTime() - now.getTime()) / 86400000) : null);
      const alerts = [];

      const cars = await db.select().from(schema.carStore);
      for (const c of cars) {
        const dl = daysLeft(c.tax_expiry);
        if (dl !== null && dl <= days) {
          alerts.push({ type: 'tax', title: `ภาษีรถ: ${c.cars_title}`, date: c.tax_expiry, daysLeft: dl, ref: { car_id: c._id } });
        }
      }

      const custs = await db.select().from(Customers);
      for (const cu of custs) {
        const di = daysLeft(cu.insurance_expiry);
        if (di !== null && di <= days) {
          alerts.push({ type: 'insurance', title: `ประกันใกล้หมด: ${cu.name}`, date: cu.insurance_expiry, daysLeft: di, ref: { customer_id: cu._id } });
        }
        const ds = daysLeft(cu.next_service_date);
        if (ds !== null && ds <= days) {
          alerts.push({ type: 'service', title: `ถึงกำหนดเช็คระยะ: ${cu.name}`, date: cu.next_service_date, daysLeft: ds, ref: { customer_id: cu._id } });
        }
      }

      // lead ใหม่จากเว็บไซต์ที่ยังไม่ได้ติดตาม → ขึ้นก่อนเสมอ
      const leadAlerts = [];
      for (const cu of custs) {
        if (cu.source === 'website' && cu.status === 'interested') {
          const daysAgo = Math.floor((now.getTime() - new Date(cu.createDate).getTime()) / 86400000);
          leadAlerts.push({
            type: 'lead',
            title: `ลูกค้าใหม่จากเว็บ: ${cu.name}`,
            date: cu.createDate,
            daysLeft: 0,
            daysAgo,
            ref: { customer_id: cu._id },
          });
        }
      }
      leadAlerts.sort((a, b) => a.daysAgo - b.daysAgo);

      alerts.sort((a, b) => a.daysLeft - b.daysLeft);
      const all = [...leadAlerts, ...alerts];
      res.send({ count: all.length, alerts: all });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
};
