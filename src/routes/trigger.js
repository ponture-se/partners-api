var express = require("express");
var router = express.Router();
var triggerMW = require("../middlewares/triggerMW");
const getSFConnection = require("../middlewares/sfMiddleware");
const validate = require("../middlewares/validate");
const triggerValidationRules = require("../models/triggerModel");


// Trigger #1
router.post('/acceptedOfferCanceled',
                triggerValidationRules.acceptedOfferCanceledModel(),
                validate,
                getSFConnection,
                triggerMW.acceptedOfferCanceledApi
                );

// Trigger 2
router.post("/sendYesterdayAcceptedPartnerInfo",
            getSFConnection,
            triggerMW.sendYesterdayAcceptedPartnerInfoApi
            );

// Trigger #3,4,5,6
router.post('/sendActiveOffersToCustomer',
            triggerValidationRules.sendActiveOffersToCustomerModel(),
            validate,
            getSFConnection,
            triggerMW.sendActiveOffersToCustomerApi);

// Trigger #7
router.post('/realTimeEmailAfterAcceptance', 
            triggerValidationRules.realTimeEmailAfterAcceptanceModel(),
            validate,
            getSFConnection,
            triggerMW.realTimeEmailAfterAcceptanceApi);

// Trigger #8
router.post('/sendOverviewToPartners', 
            getSFConnection,
            triggerMW.sendOverviewToPartners_EmailTriggerApi);


module.exports = router;