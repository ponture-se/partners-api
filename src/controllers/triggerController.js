// const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const productCtrl = require('./productController');
// const myToolkit = require('./myToolkit');
// const feedCtrl = require('./feedItemController');
const _ = require('lodash');

async function acceptedOfferCanceledController(sfConn, oppId) {
    // Section: Get Offers with details
    const proActiveStage = [
        // 'Offer Issued',
        // 'Offer Accepted'
    ]

    const whereClause = {
        // "Supplier_Partner_Opportunity__r.OpportunityId__c": oppId,
        // stage__c: {$in: proActiveStage}
    }

    let productsObject = await productCtrl.getProdcutsOfAllPartnersWithDetailsWhere(sfConn, whereClause);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    let showInList = perPartnerShowInList(partnerPMasterMap, trBoxPerCobjName);

    // Section: Send Mail if any product exist


    return productList;
}



function perPartnerShowInList(partnerPMasterMap, trBoxPerCobjName) {
    let result = {};

    for (let partnerId in partnerPMasterMap) {
        let customObjectName = partnerPMasterMap[partnerId];
        let trOfPartner = trBoxPerCobjName[customObjectName];

        if (trOfPartner.success) {
            let productTypesOfPartner = _.groupBy(_.filter(trOfPartner.result, o => {
                return o.Show_in_List__c;
            }), 'Product_Type__c');

            result[partnerId] = productTypesOfPartner;
        }
    }

    return result;
}

module.exports = {
    acceptedOfferCanceledController
}