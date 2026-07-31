const createError = require('http-errors');
const { eq, desc } = require('drizzle-orm');
const { db, schema } = require('../database/db');

const Sales = schema.sales;
const Expenses = schema.expenses;
const Cars = schema.carStore;
const Customers = schema.customers;

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const str = (v) => (v === '' || v === undefined || v === null ? null : String(v));
const dt = (v) => (v ? new Date(v) : null);

// ประกอบที่อยู่แยกส่วนเป็นข้อความเดียว ตามรูปแบบสมุดจด: "33 ม.7 ต.นาแวง อ.บ้านดุง จ.อุดรธานี"
function composeAddress(b) {
  if (b.customer_address) return b.customer_address; // ถ้าส่งมาเป็นข้อความเดียวอยู่แล้ว ใช้เลย
  const parts = [
    b.addr_no,
    b.addr_moo ? `ม.${b.addr_moo}` : null,
    b.addr_tambon ? `ต.${b.addr_tambon}` : null,
    b.addr_amphoe ? `อ.${b.addr_amphoe}` : null,
    b.addr_province ? `จ.${b.addr_province}` : null,
    b.addr_zipcode,
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

// อ่านฟิลด์การขายจาก body -> object พร้อม insert/update
// ใส่เฉพาะคีย์ที่ "ส่งมาจริง" เพื่อให้ update บางส่วนไม่ไปล้างค่าเดิม
function readSaleFields(b, { partial = false } = {}) {
  const v = {};
  const put = (key, val, sent) => { if (!partial || sent) v[key] = val; };
  put('customer_id', num(b.customer_id), b.customer_id !== undefined);
  put('customer_name', str(b.customer_name), b.customer_name !== undefined);
  put('customer_tel', str(b.customer_tel), b.customer_tel !== undefined);
  put('customer_address', composeAddress(b), b.customer_address !== undefined || b.addr_no !== undefined || b.addr_tambon !== undefined || b.addr_amphoe !== undefined || b.addr_province !== undefined || b.addr_moo !== undefined);
  put('sale_price', num(b.sale_price), b.sale_price !== undefined);
  put('down_payment', num(b.down_payment), b.down_payment !== undefined);
  put('finance_amount', num(b.finance_amount), b.finance_amount !== undefined);
  put('payment_type', str(b.payment_type), b.payment_type !== undefined);
  put('installment_amount', num(b.installment_amount), b.installment_amount !== undefined);
  put('installment_months', num(b.installment_months), b.installment_months !== undefined);
  put('advance_installments', num(b.advance_installments), b.advance_installments !== undefined);
  put('first_installment_date', dt(b.first_installment_date), b.first_installment_date !== undefined);
  put('finance_bank', str(b.finance_bank), b.finance_bank !== undefined);
  put('contract_no', str(b.contract_no), b.contract_no !== undefined);
  put('outstanding_down', num(b.outstanding_down), b.outstanding_down !== undefined);
  put('insurance_type', str(b.insurance_type), b.insurance_type !== undefined);
  put('insurance_cost', num(b.insurance_cost), b.insurance_cost !== undefined);
  put('trade_in', str(b.trade_in), b.trade_in !== undefined);
  put('trade_in_value', num(b.trade_in_value), b.trade_in_value !== undefined);
  put('transfer_date', dt(b.transfer_date), b.transfer_date !== undefined);
  put('note', str(b.note), b.note !== undefined);
  return v;
}

// สร้างลูกค้าใน CRM จากข้อมูลที่กรอกในบิลขาย
// ลูกค้ามักยังไม่ได้สร้างไว้ก่อน -> กรอกในฟอร์มขายแล้วให้ไปโผล่หน้าลูกค้าเลย แก้ทีหลังได้
async function createCustomerFromSale(b) {
  if (b.save_customer === false || b.save_customer === 'false') return null;
  const name = (b.customer_name || '').trim();
  if (!name) return null;
  const date = new Date();
  const [c] = await db.insert(Customers).values({
    name,
    tel: str(b.customer_tel),
    tel2: str(b.customer_tel2),
    id_card: str(b.customer_id_card),
    addr_no: str(b.addr_no),
    addr_moo: str(b.addr_moo),
    addr_tambon: str(b.addr_tambon),
    addr_amphoe: str(b.addr_amphoe),
    addr_province: str(b.addr_province),
    addr_zipcode: str(b.addr_zipcode),
    car_id: num(b.car_id),
    source: 'sale',           // ที่มา: สร้างจากบิลขาย
    createDate: date,
    updateDate: date,
  }).returning();
  return c._id;
}

module.exports = {
  Sales_Api: {
    // รายการขายทั้งหมด (เติมชื่อรถ + ชื่อลูกค้า)
    list_sales: async (req, res, next) => {
      try {
        const rows = await db.select().from(Sales).orderBy(desc(Sales.sale_date));
        const cars = await db.select().from(Cars);
        const custs = await db.select().from(Customers);
        const carMap = Object.fromEntries(cars.map((c) => [c._id, c.cars_title]));
        const plateMap = Object.fromEntries(cars.map((c) => [c._id, c.license_plate]));
        const cuMap = Object.fromEntries(custs.map((c) => [c._id, c.name]));
        res.send(rows.map((s) => ({
          ...s,
          car_title: carMap[s.car_id] || null,
          car_plate: plateMap[s.car_id] || null,
          // ชื่อที่โชว์: ถ้าผูกลูกค้าเดิมใช้ชื่อจาก CRM ก่อน ไม่งั้นใช้ชื่อที่กรอกในบิลขาย
          customer_name: (s.customer_id && cuMap[s.customer_id]) || s.customer_name || null,
        })));
      } catch (error) { console.log(error.message); next(error); }
    },

    // ดึงการขายรายการเดียว (ใช้ตอนเปิดฟอร์มแก้ไข)
    get_sale: async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return next(createError(400, 'Invalid sale id'));
        const [row] = await db.select().from(Sales).where(eq(Sales._id, id));
        if (!row) return next(createError(404, 'Sale not found'));
        res.send(row);
      } catch (error) { console.log(error.message); next(error); }
    },

    // บันทึกการขาย + อัปเดตสถานะรถเป็น SOLD
    create_sale: async (req, res, next) => {
      try {
        const b = req.body;
        const carId = num(b.car_id);
        if (!carId) return next(createError(422, 'car_id is required'));
        const date = new Date();
        const saleDate = b.sale_date ? new Date(b.sale_date) : date;

        // ยังไม่ได้เลือกลูกค้าเดิม -> สร้างใหม่ใน CRM จากข้อมูลที่กรอกในบิลนี้
        let customerId = num(b.customer_id);
        if (!customerId) customerId = await createCustomerFromSale(b);

        const [sale] = await db.insert(Sales).values({
          ...readSaleFields(b),
          car_id: carId,
          customer_id: customerId,
          sale_date: saleDate,
          created_by: req.user ? Number(req.user.user_id) : null,
          updateDate: date,
          createDate: date,
        }).returning();

        // อัปเดตรถ: สถานะขายแล้ว + วันขาย + ราคาขาย
        await db.update(Cars).set({
          cars_status: 'SOLD',
          soldDate: saleDate,
          ...(num(b.sale_price) != null ? { sale_price: num(b.sale_price) } : {}),
          updateDate: date,
        }).where(eq(Cars._id, carId));

        res.send(sale);
      } catch (error) { console.log(error.message); next(error); }
    },

    // แก้ไขการขาย — รองรับย้ายไปรถคันอื่น (คืนสถานะคันเดิม) และวันขาย/ราคาที่เปลี่ยน
    update_sale: async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return next(createError(400, 'Invalid sale id'));
        const b = req.body ?? {};
        const [before] = await db.select().from(Sales).where(eq(Sales._id, id));
        if (!before) return next(createError(404, 'Sale not found'));

        const date = new Date();
        const updates = readSaleFields(b, { partial: true });
        if (b.sale_date !== undefined) updates.sale_date = b.sale_date ? new Date(b.sale_date) : before.sale_date;

        // ยังไม่เคยผูกลูกค้า แต่ตอนนี้กรอกชื่อมาแล้ว -> สร้างลูกค้าใน CRM ให้
        const wantsCustomer = updates.customer_id === undefined || updates.customer_id === null;
        if (wantsCustomer && !before.customer_id && (b.customer_name || '').trim()) {
          const newId = await createCustomerFromSale({ ...b, car_id: b.car_id ?? before.car_id });
          if (newId) updates.customer_id = newId;
        }

        const newCarId = b.car_id !== undefined ? num(b.car_id) : before.car_id;
        if (newCarId) updates.car_id = newCarId;
        updates.updateDate = date;

        const [sale] = await db.update(Sales).set(updates).where(eq(Sales._id, id)).returning();

        // ย้ายไปรถคันอื่น: คืนคันเดิมเป็น SELL แล้วตั้งคันใหม่เป็น SOLD
        if (newCarId && newCarId !== before.car_id) {
          await db.update(Cars).set({ cars_status: 'SELL', soldDate: null, updateDate: date })
            .where(eq(Cars._id, before.car_id));
        }
        const carUpdates = { cars_status: 'SOLD', soldDate: sale.sale_date, updateDate: date };
        if (sale.sale_price != null) carUpdates.sale_price = sale.sale_price;
        await db.update(Cars).set(carUpdates).where(eq(Cars._id, sale.car_id));

        res.send(sale);
      } catch (error) { console.log(error.message); next(error); }
    },

    // ลบการขาย -> คืนรถกลับเป็น "พร้อมขาย" (ไม่งั้นรถค้างสถานะขายแล้วตลอดไป)
    delete_sale: async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return next(createError(400, 'Invalid sale id'));
        const [row] = await db.delete(Sales).where(eq(Sales._id, id)).returning();
        if (!row) return next(createError(404, 'Sale not found'));

        const [car] = await db.select().from(Cars).where(eq(Cars._id, row.car_id));
        if (car && car.cars_status === 'SOLD') {
          await db.update(Cars).set({ cars_status: 'SELL', soldDate: null, updateDate: new Date() })
            .where(eq(Cars._id, row.car_id));
        }
        res.send({ status: 'success', _id: id, car_restored: !!(car && car.cars_status === 'SOLD') });
      } catch (error) { console.log(error.message); next(error); }
    },
  },

  Expense_Api: {
    // ค่าใช้จ่าย/ซ่อมของรถคันหนึ่ง + ผลรวม
    list_expenses: async (req, res, next) => {
      try {
        const carId = Number(req.params.carId);
        if (Number.isNaN(carId)) return next(createError(400, 'Invalid car id'));
        const rows = await db.select().from(Expenses).where(eq(Expenses.car_id, carId)).orderBy(desc(Expenses._id));
        const total = rows.reduce((s, e) => s + (e.amount || 0), 0);
        res.send({ total, items: rows });
      } catch (error) { console.log(error.message); next(error); }
    },

    create_expense: async (req, res, next) => {
      try {
        const carId = Number(req.params.carId);
        if (Number.isNaN(carId)) return next(createError(400, 'Invalid car id'));
        const b = req.body;
        if (!b.title || num(b.amount) == null) return next(createError(422, 'title and amount are required'));
        const [row] = await db.insert(Expenses).values({
          car_id: carId,
          title: b.title,
          amount: num(b.amount),
          expense_date: b.expense_date ? new Date(b.expense_date) : null,
          note: b.note || null,
          createDate: new Date(),
        }).returning();
        res.send(row);
      } catch (error) { console.log(error.message); next(error); }
    },

    delete_expense: async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return next(createError(400, 'Invalid expense id'));
        const [row] = await db.delete(Expenses).where(eq(Expenses._id, id)).returning();
        if (!row) return next(createError(404, 'Expense not found'));
        res.send({ status: 'success', _id: id });
      } catch (error) { console.log(error.message); next(error); }
    },
  },
};
