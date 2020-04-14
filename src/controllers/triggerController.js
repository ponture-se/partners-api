// const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const productCtrl = require('./productController');
const emailCtrl = require('./emailController');
// const myToolkit = require('./myToolkit');
const feedCtrl = require('./feedItemController');
const _ = require('lodash');
const jsforce = require('jsforce');
const myToolkit = require('./myToolkit');


async function sendActiveOffersToCustomerController_case3(sfConn) {
    // Note: Trigger 3 - send an email to the customer if customer has applied between 00:00 to 12:00 PM same day and has at least one active offers and no accepted offer
 
    let offerDeactiveStages = [
        'Canceled',
        'Offer Lost',
        'Offer Won'
    ];

    // caseNumber 3
    // Section: get opportunity with stage: offer recieved in time
    let oppWhere = {
        stageName: 'Offer Received',
        lastModifiedDate: jsforce.Date.TODAY
    }
    let hourCondition = {
        min: 0,
        max: 12
    }
    let oppList = await sfConn.sobject('opportunity')
                            .select('*')
                            .where(oppWhere)
                            .execute();
    
    
    let oppListId = _.map(oppList, 'Id');
    // Section: check feedItem
    let feedList = await feedCtrl.getFeedTrackItems(sfConn, {
                                    lastModifiedDate: jsforce.Date.TODAY,
                                    type: 'TrackedChange',
                                    parentId: {$in: oppListId}
                                });
    let filteredFeeds = feedCtrl.filterSpecificTrackChangeFeeds(feedList, 'stageName', null, 'Offer Received');
    let filteredFeedsByHour = _.filter(filteredFeeds, o => {
                                        let lastModifiedDate = o.LastModifiedDate;
                                        let localeLastModifiedDate = myToolkit.convertDatetimeToSwedenLocale(lastModifiedDate) ;
                                        let localHour = myToolkit.getHourOfDateString(localeLastModifiedDate);

                                        if (localHour >= hourCondition.min && localHour < hourCondition.max) {
                                            return true;
                                        }
                                    });
    
    let finalOppListId = _.map(filteredFeedsByHour, 'ParentId');

    // Section: get active offers of these opps
    // if (filteredOppListByHourId.length == 0) return;
    if (finalOppListId.length == 0) return;
    let productWhere = {
        "Supplier_Partner_Opportunity__r.OpportunityId__c" : {$in: finalOppListId},
        // "Supplier_Partner_Opportunity__r.OpportunityId__c" : {
        //     $in: filteredOppListByHourId
        // },
        $and: [
                {stage__c: {$nin: offerDeactiveStages}},
                {stage__c: {$ne: 'Offer Accepted'}}
            ]
    }

    let offersList = await productCtrl.getProductsWhere(sfConn, productWhere);

    if (offersList.length == 0) return;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInList = generatePerPartnerShowInList(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInList);
        
        emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        
    }

}


async function sendActiveOffersToCustomerController_case4(sfConn) {
    // Note: Trigger 4 - send an email to the customer if customer has applied between 12:00 PM to 11:59:59 PM yesterday PM and has at least one active offers and no accepted offer
 
    let offerDeactiveStages = [
        'Canceled',
        'Offer Lost',
        'Offer Won'
    ];

    // caseNumber 4
    // Section: get opportunity with stage: offer recieved in time
    let oppWhere = {
        stageName: 'Offer Received',
        lastModifiedDate: jsforce.Date.YESTERDAY
    }
    let hourCondition = {
        min: 12,
        max: 24
    }
    let oppList = await sfConn.sobject('opportunity')
                            .select('*')
                            .where(oppWhere)
                            .execute();
    
    
    let oppListId = _.map(oppList, 'Id');
    // Section: check feedItem
    let feedList = await feedCtrl.getFeedTrackItems(sfConn, {
                                    lastModifiedDate: jsforce.Date.YESTERDAY,
                                    type: 'TrackedChange',
                                    parentId: {$in: oppListId}
                                });
    let filteredFeeds = feedCtrl.filterSpecificTrackChangeFeeds(feedList, 'stageName', null, 'Offer Received');
    let filteredFeedsByHour = _.filter(filteredFeeds, o => {
                                        let lastModifiedDate = o.LastModifiedDate;
                                        let localeLastModifiedDate = myToolkit.convertDatetimeToSwedenLocale(lastModifiedDate) ;
                                        let localHour = myToolkit.getHourOfDateString(localeLastModifiedDate);

                                        if (localHour >= hourCondition.min && localHour < hourCondition.max) {
                                            return true;
                                        }
                                    });
    
    let finalOppListId = _.map(filteredFeedsByHour, 'ParentId');

    // Section: get active offers of these opps
    // if (filteredOppListByHourId.length == 0) return;
    if (finalOppListId.length == 0) return;
    let productWhere = {
        "Supplier_Partner_Opportunity__r.OpportunityId__c" : {$in: finalOppListId},
        // "Supplier_Partner_Opportunity__r.OpportunityId__c" : {
        //     $in: filteredOppListByHourId
        // },
        $and: [
                {stage__c: {$nin: offerDeactiveStages}},
                {stage__c: {$ne: 'Offer Accepted'}}
            ]
    }

    let offersList = await productCtrl.getProductsWhere(sfConn, productWhere);

    if (offersList.length == 0) return;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInList = generatePerPartnerShowInList(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInList);
        
        emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        
    }

}


async function sendActiveOffersToCustomerController_case5(sfConn) {
    // Note: Trigger 5- send an email to the customer if customer has applied between 00:00 to 11:59:PM PM two days before and has at least one active offers and no accepted offer(the day before yesterday)

 
    let offerDeactiveStages = [
        'Canceled',
        'Offer Lost',
        'Offer Won'
    ];

    // caseNumber 5
    // Section: get opportunity with stage: offer recieved in time
    let oppWhere = {
        stageName: 'Offer Received',
        lastModifiedDate: jsforce.Date.LAST_N_DAYS(2)
    }
    let hourCondition = {
        min: 0,
        max: 12
    }
    let oppList = await sfConn.sobject('opportunity')
                            .select('*')
                            .where(oppWhere)
                            .execute();
    
    
    let oppListId = _.map(oppList, 'Id');
    // Section: check feedItem
    let feedList = await feedCtrl.getFeedTrackItems(sfConn, {
                                    $and: [
                                        {
                                            LastModifiedDate: {
                                                $eq: jsforce.Date.LAST_N_DAYS(2)
                                            }
                                        },
                                        {
                                            LastModifiedDate: {
                                                $ne: jsforce.Date.LAST_N_DAYS(1)
                                            }
                                        }
                                    ],
                                    type: 'TrackedChange',
                                    parentId: {$in: oppListId}
                                });
    let filteredFeeds = feedCtrl.filterSpecificTrackChangeFeeds(feedList, 'stageName', null, 'Offer Received');
    let filteredFeedsByHour = _.filter(filteredFeeds, o => {
                                        let lastModifiedDate = o.LastModifiedDate;
                                        let localeLastModifiedDate = myToolkit.convertDatetimeToSwedenLocale(lastModifiedDate) ;
                                        let localHour = myToolkit.getHourOfDateString(localeLastModifiedDate);

                                        if (localHour >= hourCondition.min && localHour < hourCondition.max) {
                                            return true;
                                        }
                                    });
    
    let finalOppListId = _.map(filteredFeedsByHour, 'ParentId');

    // Section: get active offers of these opps
    // if (filteredOppListByHourId.length == 0) return;
    if (finalOppListId.length == 0) return;
    let productWhere = {
        "Supplier_Partner_Opportunity__r.OpportunityId__c" : {$in: finalOppListId},
        // "Supplier_Partner_Opportunity__r.OpportunityId__c" : {
        //     $in: filteredOppListByHourId
        // },
        $and: [
                {stage__c: {$nin: offerDeactiveStages}},
                {stage__c: {$ne: 'Offer Accepted'}}
            ]
    }

    let offersList = await productCtrl.getProductsWhere(sfConn, productWhere);

    if (offersList.length == 0) return;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInList = generatePerPartnerShowInList(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInList);
        
        emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        
    }

}


async function sendActiveOffersToCustomerController_case6(sfConn) {
    // Note: Trigger 6- send an email to the customer if customer has applied between 00:00 to 11:59:PM PM three days before and has at least one active offers and no accepted offer(the day before the day before yesterday)

    let offerDeactiveStages = [
        'Canceled',
        'Offer Lost',
        'Offer Won'
    ];

    // caseNumber 6
    // Section: get opportunity with stage: offer recieved in time
    let oppWhere = {
        stageName: 'Offer Received',
        lastModifiedDate: jsforce.Date.LAST_N_DAYS(3)
    }
    let hourCondition = {
        min: 0,
        max: 12
    }
    let oppList = await sfConn.sobject('opportunity')
                            .select('*')
                            .where(oppWhere)
                            .execute();
    
    
    let oppListId = _.map(oppList, 'Id');
    // Section: check feedItem
    let feedList = await feedCtrl.getFeedTrackItems(sfConn, {
                                    $and: [
                                        {
                                            LastModifiedDate: {
                                                $eq: jsforce.Date.LAST_N_DAYS(3)
                                            }
                                        },
                                        {
                                            LastModifiedDate: {
                                                $ne: jsforce.Date.LAST_N_DAYS(2)
                                            }
                                        }
                                    ],
                                    type: 'TrackedChange',
                                    parentId: {$in: oppListId}
                                });
    let filteredFeeds = feedCtrl.filterSpecificTrackChangeFeeds(feedList, 'stageName', null, 'Offer Received');
    let filteredFeedsByHour = _.filter(filteredFeeds, o => {
                                        let lastModifiedDate = o.LastModifiedDate;
                                        let localeLastModifiedDate = myToolkit.convertDatetimeToSwedenLocale(lastModifiedDate) ;
                                        let localHour = myToolkit.getHourOfDateString(localeLastModifiedDate);

                                        if (localHour >= hourCondition.min && localHour < hourCondition.max) {
                                            return true;
                                        }
                                    });
    
    let finalOppListId = _.map(filteredFeedsByHour, 'ParentId');

    // Section: get active offers of these opps
    // if (filteredOppListByHourId.length == 0) return;
    if (finalOppListId.length == 0) return;
    let productWhere = {
        "Supplier_Partner_Opportunity__r.OpportunityId__c" : {$in: finalOppListId},
        // "Supplier_Partner_Opportunity__r.OpportunityId__c" : {
        //     $in: filteredOppListByHourId
        // },
        $and: [
                {stage__c: {$nin: offerDeactiveStages}},
                {stage__c: {$ne: 'Offer Accepted'}}
            ]
    }

    let offersList = await productCtrl.getProductsWhere(sfConn, productWhere);

    if (offersList.length == 0) return;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInList = generatePerPartnerShowInList(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInList);
        
        emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        
    }

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
    sendActiveOffersToCustomerController_case3,
    sendActiveOffersToCustomerController_case4,
    sendActiveOffersToCustomerController_case5,
    sendActiveOffersToCustomerController_case6
}