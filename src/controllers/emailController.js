const _ = require('lodash');
const logger = require('./customeLogger');

// Trigger 7
function prepareEmailForTrigger7(productList, perPartnerShowInList) {
    // FIXME: Mock Mail + Use perPartnerShowInList
    let emailsList = [];

    let subject = 'Partner Info By Trigger 7';

    productList.forEach(pro => {
        let primaryContact = _.get(pro, 'Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__r');

        let contactEmail = (primaryContact) ? _.get(primaryContact, 'Email') : null;
        let whatId = _.get(pro, 'Supplier_Partner_Opportunity__r.OpportunityId__c', null);

        let body = JSON.stringify(pro, null, 2);

        if (contactEmail) {
            emailsList.push(createMailObject(contactEmail, subject, body, whatId));
        }
    });

    return emailsList;

}


function prepareEmailForTrigger2(productList) {
    // FIXME: Mock MAIL
    let emailsList = [];

    let subject = 'Partner Info By Trigger 2';

    productList.forEach(pro => {
        let primaryContact = _.get(pro, 'Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__r');

        let contactEmail = (primaryContact) ? _.get(primaryContact, 'Email') : null;
        let whatId = _.get(pro, 'Supplier_Partner_Opportunity__r.OpportunityId__c', null);

        let body = JSON.stringify(_.get(pro, 'Supplier_Partner_Opportunity__r.SupplierAccountId__r', 'NO INFORMATION FOUND'), null, 2);

        if (contactEmail) {
            emailsList.push(createMailObject(contactEmail, subject, body, whatId));
        }
    });

    return emailsList;
}


function prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInList) {
    // FIXME: Mock Mail
    let emailsList = [];

    let productsPerOpp = _.groupBy(productsList, 'Supplier_Partner_Opportunity__r.OpportunityId__c');

    let subject = "Trigger ActiveOffers";

    for (let [key, value] of Object.entries(productsPerOpp)) {
        let toAddr = _.get(value, ['0', 'Supplier_Partner_Opportunity__r','OpportunityId__r','PrimaryContact__r','Email']);
        let whatId = key;
        let body = JSON.stringify(value, null, 2);

        emailsList.push(createMailObject(toAddr, subject, body, whatId));
      }
      return emailsList;
}

function prepareOverviewEmailForPartners(partners, productListPerPartners, spoListPerPartners) {
    // FIXME: Mock Email
    let emailsList = [];

    let subject = 'Check The Overview of Your Ponture Account'

    for (let [partnerId, partnerList] of Object.entries(partners)) {
        let partner = partnerList[0];
        let partnerEmail = _.get(partner, 'Email__c');
        let productOfPartner = _.get(productListPerPartners, partnerId);
        let spoOfPartner = _.get(spoListPerPartners, partnerId);

        let whatId = partnerId;

        let body = '<div>' + partner.Name + ': </div>' +
                    '<hr>'+
                    '<br/>' +
                    '<br/>' +
                    '<div>Your Accepted Products</div>' +
                    '<br/>' +
                    '<div>' + JSON.stringify(productOfPartner, null, 2) + ': </div>' +
                    '<br/>' +
                    '<br/>' +
                    '<hr>'+
                    '<div>Your SPO</div>' +
                    '<br/>' +
                    '<div>' + JSON.stringify(spoOfPartner, null, 2) + ': </div>';

        if (partnerEmail) {
            emailsList.push(createMailObject(partnerEmail, subject, body, whatId));
        }
    }

    return emailsList;
}



function createMailObject(to, subject, body, whatId = null) {

    return {
        to: to,
        subject: subject,
        body: body,
        whatId:whatId
    }

}


async function callSfSendMailAPI(sfConn, emailsList) {
    let reqBody = {
        emailsList : emailsList
    }

    let result = await sfConn.apex.post("/sendEmails", reqBody);

    return result;

}

module.exports = {
    callSfSendMailAPI,
    prepareEmailForTrigger7,
    prepareEmailForTrigger2,
    prepareEmailForTriggerActiveOffers,
    prepareOverviewEmailForPartners
}