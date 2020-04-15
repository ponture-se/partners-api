const myToolkit = require('../controllers/myToolkit');
const myResponse = require('../controllers/myResponse');
const triggerCtrl = require('../controllers/triggerController');
const emailCtrl = require('../controllers/emailController');
const { salesforceException } = require('../controllers/customeException');

async function realTimeEmailAfterAcceptanceApi(req, res, next) {
    let sfConn = req.needs.sfConn,
        proIdList = req.body.proIdList

    let resBody;
    try{
        await triggerCtrl.realTimeEmailAfterAcceptanceController(sfConn, proIdList);
        resBody = myResponse(true, null, 200, 'Emails are Sent to SF API.');
        res.status(200).send(resBody);
    } catch (e) {
        resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
        res.status(500).send(resBody);
    }

    return next();
}


async function sendOverviewToPartners_EmailTriggerApi(req, res, next) {
    let sfConn = req.needs.sfConn;

    let resBody;
    try{
        await triggerCtrl.sendOverviewToPartners_EmailTriggerController(sfConn);
        resBody = myResponse(true, null, 200, 'Emails are Sent to SF API.');
        res.status(200).send(resBody);
    } catch (e) {
        resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
        res.status(500).send(resBody);
    }

    return next();
}


module.exports = {
    realTimeEmailAfterAcceptanceApi,
    sendOverviewToPartners_EmailTriggerApi
    
}



