const createError = require('http-errors');
const { eq, desc } = require('drizzle-orm');
const { db, schema } = require('../database/db');

const Sales = schema.sales;
const Expenses = schema.expenses;
const Cars = schema.carStore;
const Customers = schema.customers;

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

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

    // บันทึกการขาย + อัปเดตสถานะรถเป็น SOLD
    create_sale: async (req, res, next) => {
      try {
        const b = req.body;
        const carId = num(b.car_id);
        if (!carId) return next(createError(422, 'car_id is required'));
        const date = new Date();
        const saleDate = b.sale_date ? new Date(b.sale_date) : date;
        const [sale] = await db.insert(Sales).values({
          car_id: carId,
          customer_id: num(b.customer_id),
          customer_name: b.customer_name || null,
          customer_tel: b.customer_tel || null,
          customer_address: b.customer_address || null,
          sale_date: saleDate,
          sale_price: num(b.sale_price),
          down_payment: num(b.down_payment),
          finance_amount: num(b.finance_amount),
          payment_type: b.payment_type || null,
          installment_amount: num(b.installment_amount),
          installment_months: num(b.installment_months),
          advance_installments: num(b.advance_installments),
          transfer_date: b.transfer_date ? new Date(b.transfer_date) : null,
          note: b.note || null,
          created_by: req.user ? Number(req.user.user_id) : null,
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

    delete_sale: async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return next(createError(400, 'Invalid sale id'));
        const [row] = await db.delete(Sales).where(eq(Sales._id, id)).returning();
        if (!row) return next(createError(404, 'Sale not found'));
        res.send({ status: 'success', _id: id });
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
