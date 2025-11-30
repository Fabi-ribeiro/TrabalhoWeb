const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { isAuthenticated } = require('../middlewares/auth');

router.get('/home', isAuthenticated, homeController.home);

module.exports = router;
