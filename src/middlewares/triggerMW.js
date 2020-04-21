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
        resBody = await triggerCtrl.realTimeEmailAfterAcceptanceController(sfConn, proIdList);
        if (resBody == null) {
            resBody = myResponse(true, null, 200, 'No Records Found, which satisfied critera.');
        } else {
            resBody = myResponse(true, resBody.data, 200, 'Emails has been sent');
        }
        res.status(200).send(resBody);
    } catch (e) {
        if (e instanceof salesforceException) {
            resBody = myResponse(false, null, e.statusCode ||500, e.message || 'Something Went Wrong.', e);
            res.status(e.statusCode ||500).send(resBody);
        } else {
            resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
            res.status(500).send(resBody);
        }
    }

    return next();
}

async function sendOverviewToPartners_EmailTriggerApi(req, res, next) {
    let sfConn = req.needs.sfConn;

    let resBody;
    try{
        resBody = await triggerCtrl.sendOverviewToPartners_EmailTriggerController(sfConn);
        if (resBody == null) {
            resBody = myResponse(true, null, 200, 'No Records Found, which satisfied critera.');
        } else {
            resBody = myResponse(true, resBody.data, 200, 'Emails has been sent');
        }
        res.status(200).send(resBody);
    } catch (e) {
        if (e instanceof salesforceException) {
            resBody = myResponse(false, null, e.statusCode ||500, e.message || 'Something Went Wrong.', e);
            res.status(e.statusCode ||500).send(resBody);
        } else {
            resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
            res.status(500).send(resBody);
        }
    }

    return next();
}

async function sendYesterdayAcceptedPartnerInfoApi(req, res, next) {
    let sfConn = req.needs.sfConn;
    
    let resBody;
    try{
        resBody = await triggerCtrl.sendYesterdayAcceptedPartnerInfoController(sfConn);
        if (resBody == null) {
            resBody = myResponse(true, null, 200, 'No Records Found, which satisfied critera.');
        } else {
            resBody = myResponse(true, resBody.data, 200, 'Emails has been sent');
        }
        res.status(200).send(resBody);
    } catch (e) {
        if (e instanceof salesforceException) {
            resBody = myResponse(false, null, e.statusCode ||500, e.message || 'Something Went Wrong.', e);
            res.status(e.statusCode ||500).send(resBody);
        } else {
            resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
            res.status(500).send(resBody);
        }
    }

    return next();

}

async function sendActiveOffersToCustomerApi(req, res, next) {
    let sfConn = req.needs.sfConn,
        caseNum = req.body.caseNum

    let resBody;
    let invalidCaseNum = false;
    try{
        switch (caseNum) {
            case 3:
                resBody = await triggerCtrl.sendActiveOffersToCustomerController_case3(sfConn);       
                break;
            case 4:
                resBody = await triggerCtrl.sendActiveOffersToCustomerController_case4(sfConn);       
                break;
            case 5:
                resBody = await triggerCtrl.sendActiveOffersToCustomerController_case5(sfConn);       
                break;
            case 6:
                resBody = await triggerCtrl.sendActiveOffersToCustomerController_case6(sfConn);       
                break;
    
            default:
                invalidCaseNum = true;
                break;
        }

        
        if (!invalidCaseNum) {
            if (resBody == null) {
                resBody = myResponse(true, null, 200, 'No Records Found, which satisfied critera.');
            } else {
                resBody = myResponse(true, resBody.data, 200, 'Emails has been sent');
            }
            res.status(200).send(resBody);
        } else {
            resBody = myResponse(false, null, 400, 'Invalid Case Number');
            res.status(400).send(resBody);
        }
    } catch (e) {
        if (e instanceof salesforceException) {
            resBody = myResponse(false, null, e.statusCode ||500, e.message || 'Something Went Wrong.', e);
            res.status(e.statusCode ||500).send(resBody);
        } else {
            resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
            res.status(500).send(resBody);
        }
    }

    return next();
}


async function acceptedOfferCanceledApi(req, res, next) {
    let sfConn = req.needs.sfConn,
        oppId = req.body.oppId;

    let resBody;
    
    try {

        resBody = await triggerCtrl.acceptedOfferCanceledController(sfConn, oppId);
        
        if (resBody == null) {
            resBody = myResponse(true, null, 200, 'No Records Found, which satisfied critera.');
        } else {
            resBody = myResponse(true, resBody.data, 200, 'Emails has been sent');
        }
        res.status(200).send(resBody);

    } catch (e) {
        if (e instanceof salesforceException) {
            resBody = myResponse(false, null, e.statusCode ||500, e.message || 'Something Went Wrong.', e);
            res.status(e.statusCode ||500).send(resBody);
        } else {
            resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
            res.status(500).send(resBody);
        }
    }

    return next();
    
}



module.exports = {
    realTimeEmailAfterAcceptanceApi,
    sendYesterdayAcceptedPartnerInfoApi,
    sendActiveOffersToCustomerApi,
    sendOverviewToPartners_EmailTriggerApi,
    acceptedOfferCanceledApi
}



