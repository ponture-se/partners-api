var express = require('express');
var router = express.Router();
var auth = require('../controllers/auth');


router.post("/login", auth.getSalesForceToken, auth.login);


module.exports = router;