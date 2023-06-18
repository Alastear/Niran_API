const createError = require('http-errors');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Models/User.model');
// const dotenv = require('dotenv').config();
module.exports = {


  createNewUser: async (req, res, next) => {
    try {
      const params = req.body;
      const finduser = await User.findOne({ username: params.username, });
      if (!finduser) {
        encryptedPassword = await bcrypt.hash(params.password, 10);
        const date = Date.now();
        const user = new User(
          {
            username: params.username,
            password: encryptedPassword,
            createDate: date,
            updateDate: date,
          }
        );
        const result = await user.save();
        const token = jwt.sign(
          { user_id: result._id },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        // save user token
        result.token = token;
        res.send({ result, token });
      } else {
        res.send({ error: "Invalid User" })
      }

    } catch (error) {
      console.log(error.message);
      if (error.name === 'ValidationError') {
        next(createError(422, error.message));
        return;
      }
      next(error);
    }
  },

  getAllUser: async (req, res, next) => {
    try {
      const results = await User.find({}, { __v: 0 });
      res.send(results);
    } catch (error) {
      console.log(error.message);
    }
  },

  loginUser: async (req, res, next) => {
    const params = req.body;
    encryptedPassword = await bcrypt.hash(params.password, 10);
    try {

      const result = await User.findOne({ username: params.username });

      if (result && (await bcrypt.compare(params.password, result.password))) {

        const token = jwt.sign(
          { user_id: result._id },
          process.env.TOKEN_KEY,
          {
            expiresIn: "24h",
          }
        );
        // save user token
        result.token = token;
        res.send({ result, token });
      } else {
        return;
      }

    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid Product id'));
        return;
      }
      next(error);
    }
  },

};
