const _ = require('lodash');
const logger = require('./customeLogger');


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



function createMailObject(to, subject, body, whatId = null) {

    return {
        to: to,
        subject: subject,
        body: body,
        whatId:whatId
    }

}


async function callSfSendMailAPI(sfConn, emailsList) {
    console.log("emailsList", emailsList);
    let reqBody = {
        emailsList : emailsList
    }

    let result = await sfConn.apex.post("/sendEmails", reqBody);

    return result;

}

module.exports = {
    callSfSendMailAPI,
    prepareEmailForTriggerActiveOffers
}