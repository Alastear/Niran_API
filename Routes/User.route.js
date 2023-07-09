const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const auth_refreshToken = require("../middleware/auth_refreshToken");
const authAdmin = require("../middleware/authAdmin");
const UserController = require('../Controllers/User.Controller');

//Get a list of all products
router.post('/login', UserController.user_login);

// refresh token
router.post('/refresh/token', auth_refreshToken, UserController.user_login);

module.exports = router;
