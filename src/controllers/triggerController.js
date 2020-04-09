// const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const productCtrl = require('./productController');
const emailCtrl = require('./emailController');
// const myToolkit = require('./myToolkit');
// const feedCtrl = require('./feedItemController');
const _ = require('lodash');

async function acceptedOfferCanceledController(sfConn, oppId) {
    // Section: Get Offers with details
    const proActiveStage = [
        'Offer Issued',
        'Offer Accepted'
    ]

    const whereClause = {
        "Supplier_Partner_Opportunity__r.OpportunityId__c": oppId,
        stage__c: {$in: proActiveStage}
    }

    let productsObject = await productCtrl.getProdcutsOfAllPartnersWithDetailsWhere(sfConn, whereClause);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    
    // Section: Send Mail if any product exist
    console.log("Products List", productsList);
    if (productsList.length > 0) {
        let perPartnerShowInList = generatePerPartnerShowInList(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForProducts(productsList, perPartnerShowInList, 1);

        // try{
        emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        // } catch (e) {
        //     console.log(e);
        // }
    }

    return null;
    // return productList;
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
    acceptedOfferCanceledController
}