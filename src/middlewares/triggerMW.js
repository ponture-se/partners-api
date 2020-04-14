const myToolkit = require('../controllers/myToolkit');
const myResponse = require('../controllers/myResponse');
const triggerCtrl = require('../controllers/triggerController');
const emailCtrl = require('../controllers/emailController');
const { salesforceException } = require('../controllers/customeException');

async function sendActiveOffersToCustomerApi(req, res, next) {
    let sfConn = req.needs.sfConn,
        caseNum = req.body.caseNum

    let resBody;
    let invalidCaseNum = false;
    try{
        switch (caseNum) {
            case 3:
                await triggerCtrl.sendActiveOffersToCustomerController_case3(sfConn);       
                break;
    
            default:
                invalidCaseNum = true;
                break;
        }

        
        if (!invalidCaseNum) {
            resBody = myResponse(true, null, 200, 'Emails are Sent to SF API.');
            res.status(200).send(resBody);
        } else {
            resBody = myResponse(false, null, 400, 'Invalid Case Number');
            res.status(400).send(resBody);
        }
    } catch (e) {
        resBody = myResponse(false, null, 500, 'Something Went Wrong.', e);
        res.status(500).send(resBody);
    }

    return next();
}


module.exports = {
    sendActiveOffersToCustomerApi
}



