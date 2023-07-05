const createError = require('http-errors');
const mongoose = require('mongoose');
const Brand = require('../Models/Brand.model');
const Model = require('../Models/Model.model');
const Detail = require('../Models/Car_Data_Detail.model');

module.exports = {
  Model_Api: {
    get_all_model: async (req, res, next) => {
      try {
        const results = await Model.find({}, { __v: 0 });
        res.send(results);
      } catch (error) {
        console.log(error.message);
      }
    },

    create_model: async (req, res, next) => {
      try {
        const body = req.body
        const date = new Date();
        body.updateDate = date;
        const models = await Model(body);
        const result = await models.save();
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    },

    update_model: async (req, res, next) => {
      try {
        const id = req.params.id
        const updates = req.body
        const date = new Date();
        updates.updateDate = date;
        const options = { new: true };
        const result = await Model.findByIdAndUpdate(id, updates, options);
        if (!result) {
          throw createError(404, 'Product does not exist');
        }
        res.send(result)
      } catch (error) {
        console.log(error.message);
      }
    },

    delete_model: async (req, res, next) => {
      try {
        const id = req.params.id;
        const result = await Model.findByIdAndDelete(id);
        if (!result) {
          throw createError(404, 'Product does not exist.');
        }
        res.send(result);
      } catch (error) {
        console.log(error.message);
        if (error instanceof mongoose.CastError) {
          next(createError(400, 'Invalid Product id'));
          return;
        }
        next(error);
      }
    }

  },

  Brand_Api: {
    get_all_brand: async (req, res, next) => {
      try {
        const results = await Brand.find({}, { __v: 0 });
        res.send(results);
      } catch (error) {
        console.log(error.message);
      }
    },

    create_brand: async (req, res, next) => {
      try {
        const body = req.body
        const date = new Date();
        body.updateDate = date;
        const brands = await Brand(body);
        const result = await brands.save();
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    },

    update_brand: async (req, res, next) => {
      try {
        const id = req.params.id
        const updates = req.body
        const date = new Date();
        updates.updateDate = date;
        const options = { new: true };
        const result = await Brand.findByIdAndUpdate(id, updates, options);
        if (!result) {
          throw createError(404, 'Product does not exist');
        }
        res.send(result)
      } catch (error) {
        console.log(error.message);
      }
    },

    delete_brand: async (req, res, next) => {
      try {
        const id = req.params.id;
        const result = await Brand.findByIdAndDelete(id);
        if (!result) {
          throw createError(404, 'Product does not exist.');
        }
        res.send(result);
      } catch (error) {
        console.log(error.message);
        if (error instanceof mongoose.CastError) {
          next(createError(400, 'Invalid Product id'));
          return;
        }
        next(error);
      }
    }
  },
  Car_Detail_Api: {
    get_all_car_detail: async (req, res, next) => {
      try {
        const results = await Detail.find({}, { __v: 0 });
        res.send(results);
      } catch (error) {
        console.log(error.message);
      }
    },

    create_car_detail: async (req, res, next) => {
      try {
        const body = req.body
        const date = new Date();
        body.updateDate = date;
        const details = await Detail(body);
        const result = await details.save();
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    },

    update_car_detail: async (req, res, next) => {
      try {
        const id = req.params.id
        const updates = req.body
        const date = new Date();
        updates.updateDate = date;
        const options = { new: true };
        const result = await Detail.findByIdAndUpdate(id, updates, options);
        if (!result) {
          throw createError(404, 'Product does not exist');
        }
        res.send(result)
      } catch (error) {
        console.log(error.message);
      }
    },

    delete_car_detail: async (req, res, next) => {
      try {
        const id = req.params.id;
        const result = await Detail.findByIdAndDelete(id);
        if (!result) {
          throw createError(404, 'Product does not exist.');
        }
        res.send(result);
      } catch (error) {
        console.log(error.message);
        if (error instanceof mongoose.CastError) {
          next(createError(400, 'Invalid Product id'));
          return;
        }
        next(error);
      }
    }
  }


};
