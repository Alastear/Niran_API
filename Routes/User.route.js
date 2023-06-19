const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const UserController = require('../Controllers/User.Controller');

//Get a list of all products
router.post('/login', UserController.user_login);
router.post('/register', UserController.user_register);
router.get('/all', UserController.get_all_user);
router.post('/update', auth, UserController.update_user);

module.exports = router;
