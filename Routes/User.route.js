const express = require('express');
const router = express.Router();

const UserController = require('../Controllers/User.Controller');

//Get a list of all products
router.post('/login', UserController.loginUser);
// router.get('/test', CarStoreController.testData);
router.post('/add', UserController.createNewUser);



module.exports = router;
