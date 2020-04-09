const myToolkit = require('../controllers/myToolkit');
const myResponse = require('../controllers/myResponse');
const triggerCtrl = require('../controllers/triggerController');
const emailCtrl = require('../controllers/emailController');
const { salesforceException } = require('../controllers/customeException');


async function acceptedOfferCanceledApi(req, res, next) {
    let sfConn = req.needs.sfConn,
        oppId = req.query.oppId;

    let result = await triggerCtrl.acceptedOfferCanceledController(sfConn, oppId);
}


module.exports = {
    prepareDataAPI
}



