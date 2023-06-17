const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");

const CarStoreController = require('../Controllers/CarStore.Controller');

//Get a list of all products
router.get('/', CarStoreController.getAllProducts);
router.get('/test', CarStoreController.testData);
router.post('/add', auth, CarStoreController.createNewCar);



module.exports = router;
