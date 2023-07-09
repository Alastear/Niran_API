const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const UserController = require('../Controllers/User.Controller');

//Get a list of all products
router.post('/login', UserController.user_login);


router.post('/refresh/token', auth, UserController.user_login);

module.exports = router;
