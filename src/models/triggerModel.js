const { body, query } = require('express-validator');


function acceptedOfferCanceledModel() {
	return [
		body('oppId').isString().withMessage("It Should be String")
                    .exists().withMessage("Required Key/Value Pair")
                    .trim()
                    .not().isEmpty().withMessage("Can not be Empty")
	];
}

function realTimeEmailAfterAcceptanceModel() {
	return [
		body('proIdList').isArray().withMessage("Value Must be Array")
                        .isLength({ min: 1 }).withMessage("At least one value should exist")
                        .exists().withMessage("Required Key/Value Pair"),
	];
}


function sendActiveOffersToCustomerModel() {
	return [
		body('caseNum').isInt().withMessage("Value Must be Array")
                        .isIn([3, 4, 5, 6]).withMessage("Valid Values are: 3, 4, 5, 6")
                        .exists().withMessage("Required Key/Value Pair"),
	];
}


module.exports = {
    acceptedOfferCanceledModel,
    realTimeEmailAfterAcceptanceModel,
    sendActiveOffersToCustomerModel
}