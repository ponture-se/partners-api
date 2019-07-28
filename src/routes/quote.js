var express = require('express');
var router = express.Router();
var auth = require('../controllers/auth');
var controller = require('../controllers/quoteController');
router.get("/products", auth.verifyToken, controller.getPartnerProducts);
router.post("/issue", auth.verifyToken, controller.issueOffer);
router.put("/accept", auth.verifyToken, controller.acceptOffer);
router.get("/myoffers", auth.verifyToken, controller.getoffers);
router.get("/acceptedoffers", auth.verifyToken, controller.acceptedoffers);
router.get("/lostapplications", auth.verifyToken, controller.lostapplications);
router.get("/fundedapplications", auth.verifyToken, controller.fundedapplications);

module.exports = router;