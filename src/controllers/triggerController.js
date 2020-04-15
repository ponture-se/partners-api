// const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const productCtrl = require('./productController');
const accCtrl = require('./accountController');
const emailCtrl = require('./emailController');
// const myToolkit = require('./myToolkit');
// const feedCtrl = require('./feedItemController');
const _ = require('lodash');


async function sendOverviewToPartners_EmailTriggerController(sfConn) {

    let productWhereClause = {
        stage__c: 'Offer Accepted'
    }

    let spoWhereClause = {
        stage__c : {
            $ne: 'Closed'
        }
    }

    let partnersList = await accCtrl.getAllPartnersAccount(sfConn);
    let activePartnerList = accCtrl.extractActivePartners(partnersList);    // have orgNumber, productMaster, and partnerRules

    let activePartnersChunkedList = _.chunk(activePartnerList, 2);

    let productList = [];
    let spoList = [];

    for (let list of activePartnersChunkedList){
        if (list.length > 0) {
            let partnersIdList = _.map(list, 'Id');

            productWhereClause["Supplier_Partner_Opportunity__r.SupplierAccountId__c"] = {$in: partnersIdList};
            spoWhereClause["SupplierAccountId__c"] = {$in: partnersIdList};
    
            let partialProductList = await sfConn.sobject('Product__c')
                                                    .select('*' + 
                                                            ', Supplier_Partner_Opportunity__r.SupplierAccountId__c' +
                                                            ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Organization_Number__c' +
                                                            ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Name' + 
                                                            ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Email__c'
                                                            )
                                                    .where(productWhereClause)
                                                    .execute();
    
            productList = productList.concat(partialProductList);
            
            let partialSpoList = await sfConn.sobject('Supplier_Partner_Opportunity__c')
                                                .select('*' + 
                                                        ', OpportunityId__r.Amount' +
                                                        ', SupplierAccountId__r.Organization_Number__c' +
                                                        ', SupplierAccountId__r.Email__c'
                                                        )
                                                .where(spoWhereClause)
                                                .execute();

            spoList = spoList.concat(partialSpoList);
        }

    }

    // Section: prepare email
    let partnersListById = _.groupBy(activePartnerList, 'Id');
    let productsListByPartnerId = _.groupBy(productList, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c');
    let spoListByPartnerId = _.groupBy(spoList, 'SupplierAccountId__c');
    
    let emailsList = emailCtrl.prepareOverviewEmailForPartners(partnersListById, productsListByPartnerId, spoListByPartnerId);

    let result = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);
    
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
    sendOverviewToPartners_EmailTriggerController
}