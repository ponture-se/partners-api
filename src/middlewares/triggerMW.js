const myToolkit = require('../controllers/myToolkit');
const myResponse = require('../controllers/myResponse');
const triggerCtrl = require('../controllers/triggerController');
const emailCtrl = require('../controllers/emailController');
const { salesforceException } = require('../controllers/customeException');


async function acceptedOfferCanceledApi(req, res, next) {
    let sfConn = req.needs.sfConn,
        oppId = req.query.oppId;

    let resBody;
    
    try {

        await triggerCtrl.acceptedOfferCanceledController(sfConn, oppId);

        resBody = myResponse(true, null, 200, 'Emails Send To SF API.');
        res.status(200).send(resBody);

    } catch (e) {

        resBody = myResponse(false, null, 500, 'Something Went Wrong', e);
        res.status(500).send(resBody);

    }
    
}


module.exports = {
    acceptedOfferCanceledApi
}



