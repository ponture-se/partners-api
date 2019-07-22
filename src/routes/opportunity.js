var express = require('express');
var router = express.Router();
var auth = require('../controllers/auth');
var controller = require('../controllers/opportunityController');
router.get("/newapplications", auth.verifyToken, auth.getSalesForceToken, controller.getNewApplications);
router.get("/opened", auth.verifyToken, auth.getSalesForceToken, controller.getOpenedApplications);

module.exports = router;