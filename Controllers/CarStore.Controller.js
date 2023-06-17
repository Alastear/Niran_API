const createError = require('http-errors');
const mongoose = require('mongoose');

const CarStore = require('../Models/Car_Store.model');

module.exports = {

  testData: async (req, res, next) => {
    try {
      res.send({
        data: Date.now()
      })
    } catch (error) {
      res.send({
        data: "asdasdas"
      })
      console.log(error.message);
    }
  },

  createNewCar: async (req, res, next) => {
    try {
      const carStore = new CarStore(req.body);
      const result = await carStore.save();
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error.name === 'ValidationError') {
        next(createError(422, error.message));
        return;
      }
      next(error);
    }
  },

  getAllProducts: async (req, res, next) => {
    try {
      const results = await CarStore.find({}, { __v: 0 });
      res.send(results);
    } catch (error) {
      console.log(error.message);
    }
  },

};
