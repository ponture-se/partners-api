var express = require('express');
var router = express.Router();
var auth = require('../controllers/auth');
var controller = require('../controllers/quoteController');
router.post("/issue", auth.verifyToken, auth.getSalesForceToken, controller.add);

module.exports = router;