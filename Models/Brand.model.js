const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  brand_name: {
    type: String,
    required: true
  },
  brand_description: {
    type: String,
  },
  brand_image: {
    type: Array,
  },
  updateDate: {
    type: Date,
    required: true
  }
});

const Brand = mongoose.model('master_brand', BrandSchema);
module.exports = Brand;
