// const accCtrl = require('./accountController');
const logger = require('./customeLogger');
const productCtrl = require('./productController');
const accCtrl = require('./accountController');
const emailCtrl = require('./emailController');
// const myToolkit = require('./myToolkit');
const feedCtrl = require('./feedItemController');
const jsforce = require('jsforce');
const _ = require('lodash');
// const jsforce = require('jsforce');
const myToolkit = require('./myToolkit');


async function acceptedOfferCanceledController(sfConn, oppId) {
    // Section: Get Offers with details
    const proActiveStage = [
        'Offer Issued',
        'Offer Accepted'
    ]

    const whereClause = {
        "Supplier_Partner_Opportunity__r.OpportunityId__c": oppId,
        "Supplier_Partner_Opportunity__r.OpportunityId__r.Notification__c": true,
        "Supplier_Partner_Opportunity__r.OpportunityId__r.Key_Deal__c": false,
        stage__c: {$in: proActiveStage}
    }

    // get offers main data
    let offersMainData = await productCtrl.getProductsWhere(sfConn, whereClause);
    if (offersMainData == null || offersMainData.length == 0) {
        return null;
    }
    
    let desiredPartnerId = _.compact(_.map(offersMainData, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    
    if (desiredPartnerId.length == 0) {
        logger.info('acceptedOfferCanceledController: No Match', {metadata: {
            oppId: oppId,
            offersMainData: offersMainData,
            desiredPartnerId: desiredPartnerId,
            developMsg: "desiredPartnerId length eq to 0 => return"
        }});
        return null;
    }

    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, whereClause);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    
    // Section: Send Mail if any product exist
    if (productsList.length > 0) {
        let perPartnerShowInEmail = generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailsForacceptedOfferCancelling(productsList, perPartnerShowInEmail);
        
        let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);

        return sendEmailResult;
        
    } else {
        return null;
    }
}

async function realTimeEmailAfterAcceptanceController(sfConn, proIdList) {
    if (proIdList == null || proIdList.length == 0) {
        return;
    }
    
    // Section: Get Offers with details
    const whereClause = {
        Id: {$in: proIdList},
        "Supplier_Partner_Opportunity__r.OpportunityId__r.Notification__c": true
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
    
    if (desiredPartnerId.length == 0) {
        logger.info('realTimeEmailAfterAcceptanceController: No Match', {metadata: {
            oppId: oppId,
            offersMainData: offersMainData,
            desiredPartnerId: desiredPartnerId,
            developMsg: "desiredPartnerId length eq to 0 => return"
        }});
        return null;
    }

    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, whereClause);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    
    // Section: Send Mail if any product exist
    if (productsList.length > 0) {
        let perPartnerShowInEmail = generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForOfferAcceptance(productsList, perPartnerShowInEmail);

        let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);

        return sendEmailResult;
    } else {
        return null;
    }
}

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
                                                            ', Supplier_Partner_Opportunity__r.OpportunityId__r.Opportunity_Number__c' +
                                                            ', Supplier_Partner_Opportunity__r.OpportunityId__r.Account.Organization_Number__c' +
                                                            ', Supplier_Partner_Opportunity__r.OpportunityId__r.Account.Name' +
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
                                                        ', OpportunityId__r.Opportunity_Number__c' +
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

    let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);

    return sendEmailResult;
    
}

async function sendYesterdayAcceptedPartnerInfoController(sfConn) {
    // Section: get desired offers
    let whereClause = {
        stage__c: "offer accepted",
        // lastModifiedDate: jsforce.Date.YESTERDAY
        "Supplier_Partner_Opportunity__r.OpportunityId__r.Notification__c": true,
        lastModifiedDate: jsforce.Date.LAST_N_DAYS(1)
    }
    let productList = await sfConn.sobject('Product__c')
                            .select('*' +
                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__c' +
                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Name' +
                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Organization_Number__c' +
                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Email__c' +
                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Phone__c' +
                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Website__c' +
                                ', Supplier_Partner_Opportunity__r.SupplierAccountId__r.Support_Description__c' +
                                ', Supplier_Partner_Opportunity__r.OpportunityId__c' +
                                ', Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__r.Email'
                            )
                            .where(whereClause)
                            .execute();
    let initialProductIdList = _.map(productList, 'Id');

    if (initialProductIdList.length <= 0) {
        return null;
    }

    // check to identify if yesterday change is on stage__c
    let feedWhereClause = {
        parentId: {
            $in: initialProductIdList
        },
        type: 'TrackedChange',
        LastModifiedDate: jsforce.Date.YESTERDAY
    }
    let feedItemsOfProducts = await feedCtrl.getFeedTrackItems(sfConn, feedWhereClause);
    let filteredFeeds = feedCtrl.filterSpecificTrackChangeFeeds(feedItemsOfProducts, 'stage__c', null, 'offer accepted');
    let desiredProductIds = _.map(filteredFeeds, 'ParentId');

    let desiredProducts = _.filter(productList, o => {
        if (desiredProductIds.includes(_.get(o, 'Id', '_no_id_'))) {
            return true;
        }
    });

    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(desiredProducts, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));

    if (desiredPartnerId.length == 0) {
        logger.info('sendYesterdayAcceptedPartnerInfoController: No Match', {metadata: {
            oppId: oppId,
            offersMainData: offersMainData,
            desiredPartnerId: desiredPartnerId,
            developMsg: "desiredPartnerId length eq to 0 => return"
        }});
        return null;
    }

    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }
    let productWhereForDetails = {
        id: {$in: desiredProductIds}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhereForDetails);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;



    // Section: Send Mail if any product exist
    if (productsList.length > 0) {
        let perPartnerShowInEmail = generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForOfferAcceptance(productsList, perPartnerShowInEmail);

        let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);

        return sendEmailResult;
    } else {
        return null;
    }

}

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
        Notification__c: true,
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
    if (!oppListId || oppListId.length == 0) return null;
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
    if (finalOppListId.length == 0) return null;
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

    if (offersList.length == 0) return null;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    
    if (desiredPartnerId.length == 0) {
        logger.info('sendActiveOffersToCustomerController_case3: No Match', {metadata: {
            oppId: oppId,
            offersMainData: offersMainData,
            desiredPartnerId: desiredPartnerId,
            developMsg: "desiredPartnerId length eq to 0 => return"
        }});
        return null;
    }

    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInEmail = generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInEmail);
        
        let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        return sendEmailResult;
    } else {
        return null;
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
        Notification__c: true,
        lastModifiedDate: jsforce.Date.LAST_N_DAYS(1)
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
    if (!oppListId || oppListId.length == 0) return null;
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
    if (finalOppListId.length == 0) return null;
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
    if (offersList.length == 0) return null;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));

    if (desiredPartnerId.length == 0) {
        logger.info('sendActiveOffersToCustomerController_case4: No Match', {metadata: {
            oppId: oppId,
            offersMainData: offersMainData,
            desiredPartnerId: desiredPartnerId,
            developMsg: "desiredPartnerId length eq to 0 => return"
        }});
        return null;
    }

    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInEmail = generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInEmail);
        
        let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);

        return sendEmailResult;
        
    } else {
        return null;
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
        Notification__c: true,
        lastModifiedDate: jsforce.Date.LAST_N_DAYS(2)
    }
    let hourCondition = {
        min: 0,
        max: 24
    }
    let oppList = await sfConn.sobject('opportunity')
                            .select('*')
                            .where(oppWhere)
                            .execute();
    
    
    let oppListId = _.map(oppList, 'Id');
    if (!oppListId || oppListId.length == 0) return null;
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
    if (finalOppListId.length == 0) return null;
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

    if (offersList.length == 0) return null;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    
    if (desiredPartnerId.length == 0) {
        logger.info('sendActiveOffersToCustomerController_case5: No Match', {metadata: {
            oppId: oppId,
            offersMainData: offersMainData,
            desiredPartnerId: desiredPartnerId,
            developMsg: "desiredPartnerId length eq to 0 => return"
        }});
        return null;
    }

    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInEmail = generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInEmail);
        let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);

        return sendEmailResult;
        
    } else {
        return null;
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
        Notification__c: true,
        lastModifiedDate: jsforce.Date.LAST_N_DAYS(3)
    }
    let hourCondition = {
        min: 0,
        max: 24
    }
    let oppList = await sfConn.sobject('opportunity')
                            .select('*')
                            .where(oppWhere)
                            .execute();
    
    
    let oppListId = _.map(oppList, 'Id');
    if (!oppListId || oppListId.length == 0) return null;
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
    if (finalOppListId.length == 0) return null;
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
    if (offersList.length == 0) return null;

    // Section: get product details by id
    // Get Desired Partner Ids to get Product Details
    let desiredPartnerId = _.compact(_.map(offersList, o => {
        return _.get(o, 'Supplier_Partner_Opportunity__r.SupplierAccountId__c', null);
    }));
    
    if (desiredPartnerId.length == 0) {
        logger.info('sendActiveOffersToCustomerController_case6: No Match', {metadata: {
            oppId: oppId,
            offersMainData: offersMainData,
            desiredPartnerId: desiredPartnerId,
            developMsg: "desiredPartnerId length eq to 0 => return"
        }});
        return null;
    }

    let partnerWhere = {
        id: {$in: desiredPartnerId}
    }

    let productsObject = await productCtrl.getProdcutsWithDetailsWhere_specificPartner(sfConn, partnerWhere, productWhere);
    let productsList = productsObject.productsList;
    let partnerPMasterMap = productsObject.partnerPMasterMap;
    let trBoxPerCobjName = productsObject.trBoxPerCobjName;

    // Section: email Section
    if (productsList.length > 0) {
        let perPartnerShowInEmail = generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName);
        let emailsList = emailCtrl.prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInEmail);
        
        let sendEmailResult = await emailCtrl.callSfSendMailAPI(sfConn, emailsList);
        return sendEmailResult;
        
    } else {
        return null;
    }

}

function generatePerPartnerShowInEmail(partnerPMasterMap, trBoxPerCobjName) {
    let result = {};

    for (let partnerId in partnerPMasterMap) {
        let customObjectName = partnerPMasterMap[partnerId];
        let trOfPartner = trBoxPerCobjName[customObjectName];

        if (trOfPartner.success) {
            // Note: Now, just consider Loan Type for Products
            let productTypesOfPartner = _.filter(trOfPartner.result, o => {
                return o.Show_In_Email__c;
            });

            // let productTypesOfPartner = _.groupBy(_.filter(trOfPartner.result, o => {
            //     return o.Show_in_List__c;
            // }), 'Product_Type__c');

            result[partnerId] = _.orderBy(productTypesOfPartner, ['index__c'], ['acs']);
        }
    }

    return result;
}




module.exports = {
    acceptedOfferCanceledController,
    realTimeEmailAfterAcceptanceController,
    sendYesterdayAcceptedPartnerInfoController,
    sendActiveOffersToCustomerController_case3,
    sendActiveOffersToCustomerController_case4,
    sendActiveOffersToCustomerController_case5,
    sendActiveOffersToCustomerController_case6,
    sendOverviewToPartners_EmailTriggerController
}