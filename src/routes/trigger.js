var express = require("express");
var router = express.Router();
var triggerMW = require("../middlewares/triggerMW");
const getSFConnection = require("../middlewares/sfMiddleware");


// Trigger 2
router.post("/sendYesterdayAcceptedPartnerInfo",
            // todo: add validation
            getSFConnection,
            triggerMW.sendYesterdayAcceptedPartnerInfo
            )




module.exports = router;