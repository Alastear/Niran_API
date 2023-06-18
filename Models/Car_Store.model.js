const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarStoreSchema = new Schema({
  cars_title: {
    type: String,
    required: true
  },
  brand_name : {
    type: String,
    required: true
  },
  model_name : {
    type: String,
    required: true
  },
  cars_image_default: {
    type: String,
  },
  cars_image: {
    type: Array,
  },
  cars_detail: {
    type: Map,
    required: true
  },
  cars_moredetail: {
    type: Map,
  },
  cars_status: {
    type: String,
    required: true
  },
  updateDate: {
    type: Date,
    required: true
  },
  createDate: {
    type: Date,
  },
  bookingDate: {
    type: Date,
  },
  soldDate: {
    type: Date,
  },
});

const CarStore = mongoose.model('car_store', CarStoreSchema);
module.exports = CarStore;
