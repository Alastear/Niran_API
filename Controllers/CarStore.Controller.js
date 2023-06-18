const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const createError = require('http-errors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const sharp = require('sharp');

const CarStore = require('../Models/Car_Store.model');

const bucket_name = process.env.BUCKET_NAME
const bucket_rerion = process.env.BUCKET_RERION
const access_key = process.env.ACCESS_KEY
const secret_access_key = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: secret_access_key,
  },
  region: bucket_rerion
})

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
      const date = new Date();
      const randomImageName = crypto.randomBytes(32).toString('hex');
      const buffer = await sharp(req.file.buffer).resize({ height: 1080, width: 1980, fit : "contain" }).toBuffer();
      const params = {
        Bucket: bucket_name,
        Key: randomImageName,
        Body: buffer,
        ContentType: req.file.mimetype,
      };
      const body = {
        cars_title : "2022 McLaren Solus GT revealed as single-seat V10",
        brand_name : "McLaren",
        model_name : "Solus GT",
        cars_image_default : randomImageName,
        cars_image : [],
        cars_detail : {
          color : "white",
          mile : "232323",
          wheel : "4"
        },
        cars_status : "SELL",
        updateDate : date,
        createDate : date,
      }
      console.log(body);
      const command = new PutObjectCommand(params);
      await s3.send(command);
      const carStore = await CarStore(body);
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

  updateCar: async (req, res, next) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const options = { new: true };

      const result = await CarStore.findByIdAndUpdate(id, updates, options);
      if (!result) {
        throw createError(404, 'Product does not exist');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        return next(createError(400, 'Invalid Product Id'));
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
