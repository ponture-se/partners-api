const { body, query } = require('express-validator');


function fundAppValidation() {
	return [
		query('offerId').isString().withMessage('It Should be String')
            .exists().withMessage("Required Key/Value Pair")
            .trim()
            .not().isEmpty().withMessage("Can not be Empty")
	];
}


module.exports = {
    fundAppValidation
}