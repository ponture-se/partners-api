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
    prepareEmailForTrigger2
}