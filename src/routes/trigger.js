var express = require("express");
var router = express.Router();
var triggerMW = require("../middlewares/triggerMW");
const getSFConnection = require("../middlewares/sfMiddleware");

router.post('/acceptedOfferCanceled',
                // todo: validation (check offer to be in list)
                getSFConnection,
                triggerMW.acceptedOfferCanceledApi
                );




module.exports = router;