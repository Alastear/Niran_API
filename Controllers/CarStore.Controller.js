const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const createError = require('http-errors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require("fs");
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
      const buffer = await sharp(req.file.buffer).resize({ height: 1080, width: 1980, fit: "contain" }).toBuffer();
      const params = {
        Bucket: bucket_name,
        Key: randomImageName,
        Body: buffer,
        ContentType: req.file.mimetype,
      };
      const body = {
        cars_title: "Hyundai Grand i10 Nios",
        brand_name: "Hyundai",
        model_name: "Grand i10 Nios",
        cars_image_default: randomImageName,
        cars_image: [],
        cars_detail: {
          color: "red",
          mile: "121221",
          wheel: "4"
        },
        cars_status: "SELL",
        updateDate: date,
        createDate: date,
      }
      const command = new PutObjectCommand(params);
      await s3.send(command);
      const carStore = await CarStore(body);
      const result = await carStore.save();
      const folderName = result._id;
      const rootFolder = "Category"
      const folderPath = `${rootFolder}/${folderName}`;
      if (fs.existsSync(rootFolder)) {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
      } else {
        fs.mkdirSync(folderPath);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
      }
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
      console.log(updates, id);
      // const result = await CarStore.findByIdAndUpdate(id, updates, options);
      // if (!result) {
      //   throw createError(404, 'Product does not exist');
      // }
      res.send({});
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        return next(createError(400, 'Invalid Product Id'));
      }

      next(error);
    }
  },

  updateCarImage: async (req, res, next) => {
    try {
      const id = req.params.id;
      const date = new Date();
      const randomImageName = crypto.randomBytes(32).toString('hex');
      const buffer = await sharp(req.file.buffer).resize({ height: 1080, width: 1980, fit: "contain" }).toBuffer();
      const params = {
        Bucket: bucket_name,
        Key: `Category/${id}/${randomImageName}`,
        Body: buffer,
        ContentType: req.file.mimetype,
      };

      const body = {
        cars_image: [
          `Category/${id}/${randomImageName}`,
        ]
      }
      const command = new PutObjectCommand(params);
      const setImage = await s3.send(command).then(() => { })
      const options = { new: true };
      const result = await CarStore.findByIdAndUpdate(id, body, options);
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

  deleteCar: async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await CarStore.findByIdAndDelete(id);
      // console.log(result);
      if (!result) {
        throw createError(404, 'Product does not exist.');
      }
      if (result.cars_image_default) {
        const paramsDeleteImage = {
          Bucket: bucket_name,
          Key: result.cars_image_default,
        }
        const command = new DeleteObjectCommand(paramsDeleteImage);
        await s3.send(command);
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

};
