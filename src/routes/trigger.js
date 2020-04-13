var express = require("express");
var router = express.Router();
var triggerMW = require("../middlewares/triggerMW");
const getSFConnection = require("../middlewares/sfMiddleware");



router.post('/realTimeEmailAfterAcceptance', 
            // todo: validation
            getSFConnection,
            triggerMW.realTimeEmailAfterAcceptanceApi)


module.exports = router;