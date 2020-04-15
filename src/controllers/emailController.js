const _ = require('lodash');
const logger = require('./customeLogger');

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
    console.log("emailsList", emailsList);
    let reqBody = {
        emailsList : emailsList
    }

    let result = await sfConn.apex.post("/sendEmails", reqBody);

    return result;

}

module.exports = {
    callSfSendMailAPI,
    prepareOverviewEmailForPartners
}