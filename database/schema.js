const { pgTable, serial, text, jsonb, timestamp, integer, boolean } = require('drizzle-orm/pg-core');

// NOTE: The primary key column is `id` in Postgres but exposed as `_id` in the
// JS object so API responses keep the same shape the frontend expects (Mongo `_id`).

const users = pgTable('users', {
  _id: serial('id').primaryKey(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  email: text('email'),
  tel: text('tel'),
  position: text('position').notNull(),
  role_id: integer('role_id'),
  createDate: timestamp('create_date').notNull(),
  updateDate: timestamp('update_date').notNull(),
});

// Dynamic RBAC: roles ที่สร้าง/แก้เองได้ + รายการสิทธิ์ (permission keys) เก็บเป็น jsonb
const roles = pgTable('roles', {
  _id: serial('id').primaryKey(),
  name: text('name').notNull(),
  permissions: jsonb('permissions').notNull(),
  is_system: boolean('is_system').default(false),
  updateDate: timestamp('update_date').notNull(),
});

const masterBrand = pgTable('master_brand', {
  _id: serial('id').primaryKey(),
  brand_name: text('brand_name').notNull(),
  brand_description: text('brand_description'),
  brand_image: text('brand_image'),
  sort_order: integer('sort_order').default(0),
  updateDate: timestamp('update_date').notNull(),
});

const masterModel = pgTable('master_model', {
  _id: serial('id').primaryKey(),
  model_name: text('model_name').notNull(),
  brand_name: text('brand_name').notNull(),
  model_submodel: jsonb('model_submodel'),
  model_description: text('model_description'),
  model_image: jsonb('model_image'),
  updateDate: timestamp('update_date').notNull(),
});

const carDataDetail = pgTable('car_data_detail', {
  _id: serial('id').primaryKey(),
  cardt_title: text('cardt_title').notNull(),
  cardt_type: text('cardt_type').notNull(),
  cardt_description: text('cardt_description'),
  updateDate: timestamp('update_date').notNull(),
});

const carStore = pgTable('car_store', {
  _id: serial('id').primaryKey(),
  cars_title: text('cars_title').notNull(),
  brand_name: text('brand_name').notNull(),
  model_name: text('model_name').notNull(),
  cars_image_default: text('cars_image_default'),
  cars_image: jsonb('cars_image'),
  cars_detail: jsonb('cars_detail').notNull(),
  cars_subdetail: jsonb('cars_subdetail'),
  cars_description: text('cars_description'),
  cars_status: text('cars_status').notNull(),
  cars_tag: text('cars_tag'),
  // ── ข้อมูลธุรกิจ (ภายใน) ──
  cost_price: integer('cost_price'),      // ราคาทุน (ลับ — เฉพาะสิทธิ์ cars.cost)
  sale_price: integer('sale_price'),      // ราคาขาย (ใช้คำนวณกำไร/รายงาน)
  tax_status: text('tax_status'),         // สถานะภาษี เช่น active/expired/none
  tax_expiry: timestamp('tax_expiry'),    // วันสิ้นอายุภาษี
  repair_notes: text('repair_notes'),     // โน้ตการซ่อมเชิงลึก (ภายใน)
  updateDate: timestamp('update_date').notNull(),
  createDate: timestamp('create_date'),
  bookingDate: timestamp('booking_date'),
  soldDate: timestamp('sold_date'),
});

// Singleton row holding the public "contact / dealer" config (branches, socials, line QR).
// Stored as one jsonb blob so the shape can evolve without migrations.
const contactInfo = pgTable('contact_info', {
  _id: serial('id').primaryKey(),
  data: jsonb('data').notNull(),
  updateDate: timestamp('update_date').notNull(),
});

// เอกสารแนบต่อรถ (เก็บไฟล์ใน Vercel Blob แบบ private)
const documents = pgTable('documents', {
  _id: serial('id').primaryKey(),
  car_id: integer('car_id').notNull(),
  doc_type: text('doc_type').notNull(),   // tax | insurance | contract | receipt | other
  file_name: text('file_name'),           // ชื่อไฟล์ต้นฉบับ
  blob_url: text('blob_url').notNull(),    // private blob url
  uploaded_by: integer('uploaded_by'),
  createDate: timestamp('create_date').notNull(),
});

// CRM: ข้อมูลลูกค้า + วันครบกำหนดไว้แจ้งเตือน (in-app alert)
const customers = pgTable('customers', {
  _id: serial('id').primaryKey(),
  name: text('name').notNull(),
  tel: text('tel'),
  email: text('email'),
  note: text('note'),
  car_id: integer('car_id'),                       // รถที่ซื้อ/เกี่ยวข้อง (ถ้ามี)
  insurance_expiry: timestamp('insurance_expiry'), // ประกันหมดอายุ
  next_service_date: timestamp('next_service_date'), // นัดเช็คระยะครั้งถัดไป
  createDate: timestamp('create_date').notNull(),
  updateDate: timestamp('update_date').notNull(),
});

module.exports = { users, roles, masterBrand, masterModel, carDataDetail, carStore, contactInfo, documents, customers };
