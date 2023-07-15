const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");

const CarStoreController = require('../Controllers/CarStore.Controller');
const MasterDataController = require('../Controllers/MasterData.Controller');

//Get list of cars
router.get('/cars', CarStoreController.get_all_car_store);
router.get('/cars/:id', CarStoreController.get_car_by_id);

//Get list of all model
router.get('/models', MasterDataController.Model_Api.get_all_model);

//Get list of all brand
router.get('/brands', MasterDataController.Brand_Api.get_all_brand);

//Get list of all car detail
router.get('/car/detail', MasterDataController.Car_Detail_Api.get_all_car_detail);

module.exports = router;
