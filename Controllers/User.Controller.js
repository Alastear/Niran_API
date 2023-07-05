const createError = require('http-errors');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Models/User.model');
// const dotenv = require('dotenv').config();
module.exports = {


  user_register: async (req, res, next) => {
    try {
      const body = req.body;
      const finduser = await User.findOne({ username: body.username, });
      if (!finduser) {
        encryptedPassword = await bcrypt.hash(body.password, 10);
        const date = Date.now();
        const user = new User(
          {
            username: body.username,
            password: encryptedPassword,
            position: body.position,
            createDate: date,
            updateDate: date,
          }
        );
        const result = await user.save();
        res.send(result);
      } else {
        res.send({ error: "Invalid User Data" })
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
          { user_id: result._id, user_name: result.username, user_position: result.position },
          process.env.TOKEN_KEY,
          {
            expiresIn: "365d",
          }
        );

        const refresh_token = jwt.sign(
          { user_id: result._id },
          process.env.REFRESH_TOKEN_KEY,
          {
            expiresIn: "365d",
          }
        );
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
      const id = req.params.id
      const date = Date.now();
      const updates = req.body;
      updates.updateDate = date;
      const options = { new: true };

      const finduser = await User.findOne({ username: updates.username });
      if (!finduser) {
        if (updates.password) {
          updates.password = await bcrypt.hash(updates.password, 10);
        }
        const result = await User.findByIdAndUpdate(id, updates, options);
        if (!result) {
          throw createError(404, 'User does not exist');
        }
        res.send(result)
      } else {
        throw createError(404, "This username can't be used");
      }

    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid User id'));
        return;
      }
      next(error);
    }
  },

  delete_user: async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await User.findByIdAndDelete(id);
      // console.log(result);
      if (!result) {
        throw createError(404, 'User does not exist.');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid User id'));
        return;
      }
      next(error);
    }
  }

};
