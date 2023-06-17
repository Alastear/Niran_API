const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
  },
  tel: {
    type: String,
  },
  createDate: {
    type: Date,
    required: true
  },
  updateDate: {
    type: Date,
    required: true
  },
});

const User = mongoose.model('user', UserSchema);
module.exports = User;
