const { body, query } = require('express-validator');


function fundAppValidation() {
	return [
		query('offerId').isString().withMessage('It Should be String')
            .exists().withMessage("Required Key/Value Pair")
            .trim()
            .not().isEmpty().withMessage("Can not be Empty"),
        query('loanAmount').isFloat({gt: 0.0}).withMessage('It Should be Float Greater Than 0.0')
            .exists().withMessage("Required Key/Value Pair")
            .trim()
            .not().isEmpty().withMessage("Can not be Empty"),
        query('loanPeriod').isInt({gt: 0}).withMessage('It Should be Integer Number Greater Than 0')
            .exists().withMessage("Required Key/Value Pair")
            .trim()
            .not().isEmpty().withMessage("Can not be Empty")
	];
}


module.exports = {
    fundAppValidation
}