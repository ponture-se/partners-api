const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const _ = require('lodash');

async function getProdcutsOfAllPartnersWithDetailsWhere(sfConn, whereClause = {}) {
    // Section: Getting MetaData
    let partnersList = await accCtrl.getAllPartnersAccount(sfConn);
    let activePartnerList = accCtrl.extractActivePartners(partnersList);    // have orgNumber, productMaster, and partnerRules

    //      Get SF Custom Object Names of Active Partners from their Product Master Records
    let partnerPMasterMap = generatePartnerProductMasterMap(activePartnerList);
    let cObjNameList = Object.values(partnerPMasterMap);

    //      Get List of Custome Fields for each partner, based on their custom sObject Name
    let trBoxPerCobjName = await accCtrl.getPartnersTranslationBoxByCobjName(cObjNameList, sfConn);

    //      Get Metadata of relationships
    let productDetailsObjApiNamePerPartner = generateProductDetailsObjApiNamePerPartnerId(partnerPMasterMap, trBoxPerCobjName);
    let productChildsApiRelMap = await getProductChildsApiRelMap(sfConn);

    // Section: Main Query
    let productsList = await getDesiredResultPerPartnerApiCall(sfConn, productDetailsObjApiNamePerPartner, productChildsApiRelMap, whereClause);

    return {
        productsList: productsList,
        trBoxPerCobjName: trBoxPerCobjName,
        partnerPMasterMap: partnerPMasterMap
    };
}


async function getProdcutsWithDetailsWhere_specificPartner(sfConn, wherePartner = {}, whereClause = {}) {
    // Section: Getting MetaData
    let partnersList = await accCtrl.getPartnersAccountWhich(sfConn, wherePartner);
    let activePartnerList = accCtrl.extractActivePartners(partnersList);    // have orgNumber, productMaster, and partnerRules

    //      Get SF Custom Object Names of Active Partners from their Product Master Records
    let partnerPMasterMap = generatePartnerProductMasterMap(activePartnerList);
    let cObjNameList = Object.values(partnerPMasterMap);

    //      Get List of Custome Fields for each partner, based on their custom sObject Name
    let trBoxPerCobjName = await accCtrl.getPartnersTranslationBoxByCobjName(cObjNameList, sfConn);

    //      Get Metadata of relationships
    let productDetailsObjApiNamePerPartner = generateProductDetailsObjApiNamePerPartnerId(partnerPMasterMap, trBoxPerCobjName);
    let productChildsApiRelMap = await getProductChildsApiRelMap(sfConn);

    // Section: Main Query
    let productsList = await getDesiredResultPerPartnerApiCall(sfConn, productDetailsObjApiNamePerPartner, productChildsApiRelMap, whereClause);

    return {
        productsList: productsList,
        trBoxPerCobjName: trBoxPerCobjName,
        partnerPMasterMap: partnerPMasterMap
    };
}

async function getProductsWhere(sfConn, whereClause) {

    try{
        let productList = await sfConn.sobject("Product__c")
                                        .select("*" +
                                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__c' +
                                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Organization_Number__c' +
                                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Name'
                                        )
                                        .where(whereClause)
                                        .execute();
        return productList;
    } catch (e) {
        logger.error('getProductsWhere Func Error', {metadata: e});
        throw e;
    }
}



function generatePartnerProductMasterMap(activePartnerList) {
    let result = {};
    
    let partner;
    let partnerId;
    let productMasterRecords;

    for (let i in activePartnerList) {
        partner = activePartnerList[i];
        partnerId = partner.Organization_Number__c;
        productMasterRecords = partner.Products_Master__r.records;

        for (j in productMasterRecords) {
            if (result[partnerId]) {
                break;
            }

            if (productMasterRecords[j].Custom_Object_Name__c && productMasterRecords[j].Custom_Object_Name__c.trim() != '') {

                result[partnerId] = productMasterRecords[j].Custom_Object_Name__c;

            }
        }
    }

    return result;
}



function generateProductDetailsObjApiNamePerPartnerId(partnerPMasterMap, trBoxPerCobjName){
    let result = {};

    for (let partnerId in partnerPMasterMap) {
        let customObjectName = partnerPMasterMap[partnerId];
        let trOfPartner = trBoxPerCobjName[customObjectName];

        if (trOfPartner.success) {
            let productTypesOfPartner = _.uniq(_.map(trOfPartner.result, 'Product_Type__c'));

            let detailsSobjNames = productTypesOfPartner.map((item) => {
                return (item + '_' + customObjectName + '__c');
            });

            result[partnerId] = detailsSobjNames;
        }
    }

    return result;
}



async function getProductChildsApiRelMap(sfConn = null) {
    let childApiRelMap = {};
    
    sfConn = (sfConn) ? sfConn : await myToolkit.makeSFConnection();
    if (sfConn == null) {
        throw new Error('CAN NOT MAKE SF CONNECTION');
    }

    try {
        let productDescribe = await sfConn.sobject('Product__c').describe();
        
        productDescribe.childRelationships.forEach(child => {
            childApiRelMap[child.childSObject] = child.relationshipName;
        });

    } catch (err) {
        logger.error('getProductChildsApiRelMap Error', {
            metadata: childApiRelMap
        });
        throw err;
    }

    return childApiRelMap;

}



async function getDesiredResultPerPartnerApiCall(sfConn, productDetailsObjApiNamePerPartner, productChildsApiRelMap, whereClause = {}) {
    // let result = {};
    let productList = [];
    for (let partnerId in productDetailsObjApiNamePerPartner) {
        // if (result[partnerId] == null) {
        //     result[partnerId] = [];
        // }

        let childApiNamesList = productDetailsObjApiNamePerPartner[partnerId];
        
        for (let i in childApiNamesList) {
            let apiName = childApiNamesList[i];
            let childRelName = productChildsApiRelMap[apiName];

            try{
                let partialResult = await getProductWithDetailsByPartnerIdAndcObjName(sfConn, partnerId, childRelName, whereClause);
                
                // result[partnerId] = result[partnerId].concat(partialResult);
                productList = productList.concat(partialResult);
            } catch (err) {
                console.log({err: err,
                            partnerId: partnerId,
                            childRelName: childRelName});
                continue;
            }
        }
    }

    // OffersPerOpp
    // let offersPerOppId = _.groupBy(productList, o => {
    //                     return _.get(o, 'Supplier_Partner_Opportunity__r.OpportunityId__c', 'withoutOpp');
    //                 });

    // return {
    //     perPartnerProducts: result,
    //     perOppId: offersPerOppId,
    //     productsList: productList
    // };

    return productList;
}



async function getProductWithDetailsByPartnerIdAndcObjName(sfConn, partnerId, customObjectApiName, whereClause = {}) {
    let finalResult = [];
    // sfConn = (sfConn) ? sfConn : await myToolkit.makeSFConnection();
    // if (sfConn == null) {
    //     throw new Error('CAN NOT MAKE SF CONNECTION');
    // }

    // Because of Per Partner Query attitude
    let finalWhereClause = whereClause;
    finalWhereClause["Supplier_Partner_Opportunity__r.SupplierAccountId__r.Organization_Number__c"]  = partnerId;   // initial condition

    // Note: Check Products to have changes in Last N Days, then we check chatter to identify the exact time of the change we look for
    // if (for_last_n_days != null) {
    //     if (queryType == 'opp') {
    //         finalWhereClause += " AND Supplier_Partner_Opportunity__r.OpportunityId__r.LastModifiedDate = LAST_N_DAYS:" + for_last_n_days;
    //     } else if (queryType == 'pro') {
    //         finalWhereClause += " AND LastModifiedDate = LAST_N_DAYS:" + for_last_n_days;
    //     }
    // }

    // if (offerStage != null) {
    //     finalWhereClause += " AND Stage__c = '" + offerStage + "'";
    // }

    // if (oppStage != null) {
    //     finalWhereClause += " AND Supplier_Partner_Opportunity__r.OpportunityId__r.StageName = '" + oppStage + "'";
    // }

    let initailResult = await sfConn.sobject('Product__c')
                                    .select('*' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__c' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__r.StageName' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__r.CreatedDate' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__r.LastModifiedDate' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__c' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__r.Email' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__r.FirstName' +
                                        ', Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__r.LastName' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__c' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Organization_Number__c' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Name' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Display_Name__c' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Email__c' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Email__c' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Phone__c' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Website__c' +
                                        ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Description__c'
                                        
                                    )
                                        .include(customObjectApiName)
                                        .end()
                                    .where(finalWhereClause)
                                    .execute();

    let initialProduct = {};
    let productDetails = {};
    let finalProduct = {};               
    for (let i in initailResult) {
        initialProduct = initailResult[i];
        productDetails = initialProduct[customObjectApiName];

        if (initialProduct != null && productDetails != null && 
        productDetails.totalSize != null && productDetails.totalSize > 0 && 
        productDetails.done != null && productDetails.done == true &&
        productDetails.records != null && _.size(productDetails) > 0) {
            
            // Each product has only one detail
            finalProduct = initialProduct;
            finalProduct['details'] = productDetails.records[0];
            finalProduct['details']['child_relation_name'] = customObjectApiName;

            if (finalProduct.hasOwnProperty(customObjectApiName)){
                delete finalProduct[customObjectApiName];
            }
    
            finalResult.push(finalProduct);

        }
        // Note: Different details childs for a partner, may cause problems (if different approaches were taken)
        // else if (initialProduct != null){
        //     finalProduct['details'] = {};
        // }

    }
    
    // logger.info('getProductWithDetails ' + partnerId, {
    //     metadata: finalResult
    // });

    return finalResult;
}


module.exports = {
    getProdcutsOfAllPartnersWithDetailsWhere,
    getProdcutsWithDetailsWhere_specificPartner,
    getProductsWhere
}