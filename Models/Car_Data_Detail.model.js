const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarDataDetailSchema = new Schema({
  cardt_title: {
    type: String,
    required: true
  },
  cardt_type: {
    type: String,
    required: true
  },
  cardt_description: {
    type: String,
  },
  updateDate: {
    type: Date,
    required: true
  }
});

const CarDataDetail = mongoose.model('car_data_detail', CarDataDetailSchema);
module.exports = CarDataDetail;
