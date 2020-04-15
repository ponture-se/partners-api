var express = require("express");
var router = express.Router();
var triggerMW = require("../middlewares/triggerMW");
const getSFConnection = require("../middlewares/sfMiddleware");



router.post('/realTimeEmailAfterAcceptance', 
            // todo: validation
            getSFConnection,
            triggerMW.realTimeEmailAfterAcceptanceApi);
            
router.post('/sendOverviewToPartners', 
            // todo: validation
            getSFConnection,
            triggerMW.sendOverviewToPartners_EmailTriggerApi);



module.exports = router;