// const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const productCtrl = require('./productController');
const emailCtrl = require('./emailController');
// const myToolkit = require('./myToolkit');
// const feedCtrl = require('./feedItemController');
const _ = require('lodash');


async function realTimeEmailAfterAcceptanceController(sfConn, proIdList) {
    if (proIdList == null || proIdList.length == 0) {
        return;
    }
    
    // Section: Get Offers with details
    const whereClause = {
        Id: {$in: proIdList}
    }

    // get offers main data
    let offersMainData = await productCtrl.getProductsWhere(sfConn, whereClause);
    if (offersMainData == null || offersMainData.length == 0) {
        return;
    }
    
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersMainData, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, whereClause);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    
    // Section: Send Mail if any product exist
    if (productsList.length > 0) {
        let perPartnerShowInList = generatePerPartnerShowInList(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTrigger7(productsList, perPartnerShowInList, 1);
        
        emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        
    }

    return;
}




function generatePerPartnerShowInList(partnerPMasterMap, trBoxPerCobjName) {
    let result = {};

    for (let partnerId in partnerPMasterMap) {
        let customObjectName = partnerPMasterMap[partnerId];
        let trOfPartner = trBoxPerCobjName[customObjectName];

        if (trOfPartner.success) {
            // Note: Now, just consider Loan Type for Products
            let productTypesOfPartner = _.filter(trOfPartner.result, o => {
                return o.Show_in_List__c;
            });

            // let productTypesOfPartner = _.groupBy(_.filter(trOfPartner.result, o => {
            //     return o.Show_in_List__c;
            // }), 'Product_Type__c');

            result[partnerId] = productTypesOfPartner;
        }
    }

    return result;
}


module.exports = {
    realTimeEmailAfterAcceptanceController
}