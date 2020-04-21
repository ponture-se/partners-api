var express = require("express");
var router = express.Router();
var triggerMW = require("../middlewares/triggerMW");
const getSFConnection = require("../middlewares/sfMiddleware");


// Trigger #1
router.post('/acceptedOfferCanceled',
                // todo: validation (check offer to be in list)
                getSFConnection,
                triggerMW.acceptedOfferCanceledApi
                );

// Trigger 2
router.post("/sendYesterdayAcceptedPartnerInfo",
            // todo: add validation
            getSFConnection,
            triggerMW.sendYesterdayAcceptedPartnerInfoApi
            );

// Trigger #3,4,5,6
router.post('/sendActiveOffersToCustomer',
            // todo: validation,
            getSFConnection,
            triggerMW.sendActiveOffersToCustomerApi);

// Trigger #7
router.post('/realTimeEmailAfterAcceptance', 
            // todo: validation
            getSFConnection,
            triggerMW.realTimeEmailAfterAcceptanceApi);

// Trigger #8
router.post('/sendOverviewToPartners', 
            // todo: validation
            getSFConnection,
            triggerMW.sendOverviewToPartners_EmailTriggerApi);


module.exports = router;