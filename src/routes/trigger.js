var express = require("express");
var router = express.Router();
var triggerMW = require("../middlewares/triggerMW");
const getSFConnection = require("../middlewares/sfMiddleware");

// Trigger #3,4,5,6
router.post('/sendActiveOffersToCustomer',
            // todo: validation,
            getSFConnection,
            triggerMW.sendActiveOffersToCustomerApi);



module.exports = router;