const createError = require('http-errors');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Models/User.model');
// const dotenv = require('dotenv').config();
module.exports = {


  user_register: async (req, res, next) => {
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
          { user_id: result._id, user_name: result.username },
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

  get_all_user: async (req, res, next) => {
    try {
      const results = await User.find({}, { __v: 0 }).select("-password");
      res.send(results);
    } catch (error) {
      console.log(error.message);
    }
  },

  user_login: async (req, res, next) => {
    const params = req.body;
    try {

      const result = await User.findOne({ username: params.username });

      if (result && (await bcrypt.compare(params.password, result.password))) {

        const access_token = jwt.sign(
          { user_id: result._id, user_name: result.username },
          process.env.TOKEN_KEY,
          {
            expiresIn: "4h",
          }
        );

        const refresh_token = jwt.sign(
          { user_id: result._id, user_name: result.username },
          process.env.REFRESH_TOKEN_KEY,
          {
            expiresIn: "24h",
          }
        );
        // save user token
        result.access_token = access_token;
        result.refresh_token = refresh_token;
        res.send({ result, access_token, refresh_token });
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

  update_user: async (req, res, next) => {
    try {
      console.log(req.user);
      const date = Date.now();
      const updates = req.body;
      updates.updateDate = date;
      const options = { new: true };
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      const result = await User.findByIdAndUpdate(req.user.user_id, updates, options);
      if (!result) {
        throw createError(404, 'Product does not exist');
      }
      res.send(result)
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
