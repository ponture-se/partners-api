const quoteController = require("../controllers/quoteController");
const myResponse = require('../controllers/myResponse');


async function fundAppApi(req, res, next) {
    const sfConn = req.needs.sfConn;
    let resBody;

    let offerId = req.query.offerId,
        loanAmount = req.query.loanAmount,
        loanPeriod = req.query.loanPeriod,
        partnerId = req.partnerId;

    try {
        resBody = await quoteController.fundAppController(sfConn, offerId, partnerId, loanAmount, loanPeriod);
        // resBody = myResponse(true, result, 200);
    } catch(e) {
        resBody = myResponse(false, null, e.statusCode, e.message, e);
    }

    res.status(resBody.statusCode).send(resBody);

    return next();
}

module.exports = {
    fundAppApi
}