const { pgTable, serial, text, jsonb, timestamp } = require('drizzle-orm/pg-core');

// NOTE: The primary key column is `id` in Postgres but exposed as `_id` in the
// JS object so API responses keep the same shape the frontend expects (Mongo `_id`).

const users = pgTable('users', {
  _id: serial('id').primaryKey(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  email: text('email'),
  tel: text('tel'),
  position: text('position').notNull(),
  createDate: timestamp('create_date').notNull(),
  updateDate: timestamp('update_date').notNull(),
});

const masterBrand = pgTable('master_brand', {
  _id: serial('id').primaryKey(),
  brand_name: text('brand_name').notNull(),
  brand_description: text('brand_description'),
  brand_image: text('brand_image'),
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
  updateDate: timestamp('update_date').notNull(),
  createDate: timestamp('create_date'),
  bookingDate: timestamp('booking_date'),
  soldDate: timestamp('sold_date'),
});

module.exports = { users, masterBrand, masterModel, carDataDetail, carStore };
