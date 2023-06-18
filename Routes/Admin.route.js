const express = require('express');
const router = express.Router();
const multer = require("multer")
const auth = require("../middleware/auth");

const CarStoreController = require('../Controllers/CarStore.Controller');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

router.post('/add/cars', upload.single('image'), CarStoreController.createNewCar);
router.post('/edit/cars/:id', upload.single('image'), CarStoreController.updateCar);



module.exports = router;
