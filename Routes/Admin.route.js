const express = require('express');
const router = express.Router();
const multer = require("multer")

const CarStoreController = require('../Controllers/CarStore.Controller');
const MasterDataController = require('../Controllers/MasterData.Controller');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// manage car
router.post('/create/cars', upload.single('image'), CarStoreController.create_car_store);
router.post('/update/cars/:id', upload.single('image'), CarStoreController.update_car_store);
router.post('/update/cars/image/gallery/:id', upload.array('image',10), CarStoreController.update_car_store_image_gallery);
router.post('/delete/cars/image/gallery/:id', CarStoreController.delete_car_store_image_gallery);
router.get('/delete/cars/:id', CarStoreController.delete_car_store);

// manage master data model
router.post('/create/model',MasterDataController.Model_Api.create_model)
router.post('/update/model/:id',MasterDataController.Model_Api.update_model)
router.get('/delete/model/:id',MasterDataController.Model_Api.delete_model)

// manage master data brand
router.post('/create/brand',MasterDataController.Brand_Api.create_brand)
router.post('/update/brand/:id',MasterDataController.Brand_Api.update_brand)
router.post('/delete/brand/:id',MasterDataController.Brand_Api.delete_brand)

// test auth
router.get('/car/all',CarStoreController.get_all_car_store)

module.exports = router;
