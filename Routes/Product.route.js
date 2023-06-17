const express = require('express');
const router = express.Router();

const ProductController = require('../Controllers/Product.Controller');

//Get a list of all products
router.get('/', ProductController.getAllProducts);


module.exports = router;
