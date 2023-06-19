const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");

const CarStoreController = require('../Controllers/CarStore.Controller');

//Get a list of all products
router.get('/', CarStoreController.get_all_car_store);



module.exports = router;
