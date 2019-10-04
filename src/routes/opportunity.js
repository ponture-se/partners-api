var express = require("express");
var router = express.Router();
var auth = require("../controllers/auth");
var controller = require("../controllers/opportunityController");
router.get("/closereasons", auth.verifyToken, controller.getCloseReasons);
router.get("/allnew", auth.verifyToken, controller.getNewApplications);
router.get("/opened", auth.verifyToken, controller.getOpenedApplications);
router.put("/open", auth.verifyToken, controller.openApplication);
router.put("/reject", auth.verifyToken, controller.rejectApplication);
router.get("/creditreport", auth.verifyToken, controller.getCreditReport);

module.exports = router;
