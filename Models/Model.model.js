const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelSchema = new Schema({
  model_name: {
    type: String,
    required: true
  },
  brand_name: {
    type: String,
    required: true
  },
  model_submodel: {
    type: Array,
  },
  model_description: {
    type: String,
  },
  model_image: {
    type: Array,
  },
  updateDate: {
    type: Date,
    required: true
  }
});

const model = mongoose.model('master_model', ModelSchema);
module.exports = model;
