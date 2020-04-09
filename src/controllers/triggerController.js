const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const productCtrl = require('./productController');
const myToolkit = require('./myToolkit');
const feedCtrl = require('./feedItemController');
const _ = require('lodash');

function acceptedOfferCanceledController(sfConn, oppId) {
    // TODO: Get Offers with details
}

module.exports = {
    acceptedOfferCanceledController
}