const _ = require('lodash');
const logger = require('./customeLogger');
const fs = require('fs');
const util = require('util');
const path = require("path");


const staticResource = path.resolve(__dirname, '../staticResources');

// Trigger 7
function prepareEmailForOfferAcceptance(productList, perPartnerShowInEmail) {
    // FIXME: Mock Mail + Use perPartnerShowInEmail
    let emailsList = [];
    let subject = 'Partner Info By Trigger 7';
    
    let htmlBodyAddr = staticResource + "\\confirmOfferAccepted1.html";
    
    let emailTemplate;
    try {
        emailTemplate = fs.readFileSync(htmlBodyAddr, 'utf8');
    } catch (e) {
        logger.error('readFileSync Error', {metadata: {
            addrs: [
                mainHtmlBodyAddr,
                offerHtmlTemplate
            ],
            input: {
                productList: productsList,
                perPartnerShowInEmail: perPartnerShowInEmail
            }
        }});
        throw e;
    }

    productList.forEach(pro => {
        let primaryContact = _.get(pro, 'Supplier_Partner_Opportunity__r.OpportunityId__r.PrimaryContact__r');
        let partner = _.get(pro, 'Supplier_Partner_Opportunity__r.SupplierAccountId__r');

        let partnerId = _.get(partner, 'Organization_Number__c');
        let showInEmailForPartner = (partnerId) ? _.get(perPartnerShowInEmail, partnerId, []) : [];

        let partnerDynamicFields = generateDynamicContent(pro, showInEmailForPartner);

        let contactEmail = (primaryContact) ? _.get(primaryContact, 'Email') : null;
        let whatId = _.get(pro, 'Supplier_Partner_Opportunity__r.OpportunityId__c', null);
        
        let html = emailTemplate;

        let customerName = _.get(primaryContact, 'FirstName') || _.get(primaryContact, 'LastName') || '';
        let partnerName = _.get(partner, 'Display_Name__c') || _.get(partner, 'Name') || '';
        let partnerPhone = _.get(partner, 'Support_Phone__c', '---') || '---';
        let loanAmount = _.get(pro, 'Amount__c', '---') || '---';
        let loanPeriod = _.get(pro, 'Loan_Period__c', '---') || '---';
        // let totalMonthlyPayment = _.get(pro, 'details.Total_monthly_payment__c', '---') || '---';


        html = html.replace(/{{First_Name}}/gi, customerName);
        html = html.replace(/{{partner_name}}/gi, partnerName);
        html = html.replace(/{{partner_telefon}}/gi, partnerPhone);
        html = html.replace(/{{loan_amount}}/gi, loanAmount);
        html = html.replace(/{{loan_period}}/gi, loanPeriod);
        html = html.replace(/{{Dynamic_fields}}/gi, partnerDynamicFields);

        if (contactEmail) {
            emailsList.push(createMailObject(contactEmail, subject, html, whatId));
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


function prepareEmailForTriggerActiveOffers(productsList, perPartnerShowInEmail) {
    // FIXME: Mock Mail
    let emailsList = [];

    let productsPerOpp = _.groupBy(productsList, 'Supplier_Partner_Opportunity__r.OpportunityId__c');

    let subject = "Trigger ActiveOffers";
        
    let mainHtmlBodyAddr = staticResource + "\\offersOverview.html";
    let offerTemplateHtmlAddr = staticResource + "\\offerTemplate.html";

    let mainHtmlTemplate,
        offerHtmlTemplate;
    try {
        mainHtmlTemplate = fs.readFileSync(mainHtmlBodyAddr, 'utf8');
        offerHtmlTemplate = fs.readFileSync(offerTemplateHtmlAddr, 'utf8');
    } catch (e) {
        logger.error('readFileSync Error', {metadata: {
            addrs: [
                mainHtmlBodyAddr,
                offerHtmlTemplate
            ],
            input: {
                productList: productsList,
                perPartnerShowInEmail: perPartnerShowInEmail
            }
        }});
        
        throw e;
    }


    for (let [oppId, productList] of Object.entries(productsPerOpp)) {
        let mainHtml = mainHtmlTemplate;

        let primaryContact = _.get(productList, ['0','Supplier_Partner_Opportunity__r','OpportunityId__r', 'PrimaryContact__r']);
        let contactEmail = (primaryContact) ? _.get(primaryContact, 'Email') : null;
        
        let whatId = _.get(productList, ['0', 'Supplier_Partner_Opportunity__r', 'OpportunityId__c'], null);
        let customerName = _.get(primaryContact, 'FirstName') || _.get(primaryContact, 'LastName') || '';

        mainHtml = mainHtml.replace(/{{First_Name}}/gi, customerName);

        let allOfferHtml = '';
        productList.forEach(pro => {
            let offerHtml = offerHtmlTemplate;
            
            let partner = _.get(pro, 'Supplier_Partner_Opportunity__r.SupplierAccountId__r');

            let partnerId = _.get(partner, 'Organization_Number__c');
            let showInEmailForPartner = (partnerId) ? _.get(perPartnerShowInEmail, partnerId, []) : [];

            let partnerDynamicFields = generateDynamicContent(pro, showInEmailForPartner);
            
            let partnerName = _.get(partner, 'Display_Name__c') || _.get(partner, 'Name') || '';
            let loanAmount = _.get(pro, 'Amount__c', '---') || '---';
            let loanPeriod = _.get(pro, 'Loan_Period__c', '---') || '---';
            // let totalMonthlyPayment = _.get(pro, 'details.Total_monthly_payment__c', '---') || '---';            
            
            offerHtml = offerHtml.replace(/{{partner_name}}/gi, partnerName);
            offerHtml = offerHtml.replace(/{{Loan_amount}}/gi, loanAmount);
            offerHtml = offerHtml.replace(/{{Loan_period}}/gi, loanPeriod);
            // offerHtml = offerHtml.replace(/{{Totalt_kostnad_per_månad}}/gi, totalMonthlyPayment);
            offerHtml = offerHtml.replace(/{{Dynamic_fields}}/gi, partnerDynamicFields);

            allOfferHtml += offerHtml;
        });

        mainHtml = mainHtml.replace(/{{offers_list}}/gi, allOfferHtml);
        
        if (contactEmail) {
            emailsList.push(createMailObject(contactEmail, subject, mainHtml, whatId));
        }
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


function prepareEmailsForacceptedOfferCancelling(productsList, perPartnerShowInEmail) {
    let emailsList = [];

    let productsPerOpp = _.groupBy(productsList, 'Supplier_Partner_Opportunity__r.OpportunityId__c');

    let subject = "Trigger ActiveOffers";
        
    let mainHtmlBodyAddr = staticResource + "\\offersOverview.html";
    let offerTemplateHtmlAddr = staticResource + "\\offerTemplate.html";

    let mainHtmlTemplate,
        offerHtmlTemplate;
    try {
        mainHtmlTemplate = fs.readFileSync(mainHtmlBodyAddr, 'utf8');
        offerHtmlTemplate = fs.readFileSync(offerTemplateHtmlAddr, 'utf8');
    } catch (e) {
        logger.error('readFileSync Error', {metadata: {
            addrs: [
                mainHtmlBodyAddr,
                offerHtmlTemplate
            ],
            input: {
                productList: productsList,
                perPartnerShowInEmail: perPartnerShowInEmail
            }
        }});
        
        throw e;
    }


    for (let [oppId, productList] of Object.entries(productsPerOpp)) {
        let mainHtml = mainHtmlTemplate;

        let primaryContact = _.get(productList, ['0','Supplier_Partner_Opportunity__r','OpportunityId__r', 'PrimaryContact__r']);
        let contactEmail = (primaryContact) ? _.get(primaryContact, 'Email') : null;
        
        let whatId = _.get(productList, ['0', 'Supplier_Partner_Opportunity__r', 'OpportunityId__c'], null);
        let customerName = _.get(primaryContact, 'FirstName') || _.get(primaryContact, 'LastName') || '';

        mainHtml = mainHtml.replace(/{{First_Name}}/gi, customerName);

        let allOfferHtml = '';
        productList.forEach(pro => {
            let offerHtml = offerHtmlTemplate;
            
            let partner = _.get(pro, 'Supplier_Partner_Opportunity__r.SupplierAccountId__r');

            let partnerId = _.get(partner, 'Organization_Number__c');
            let showInEmailForPartner = (partnerId) ? _.get(perPartnerShowInEmail, partnerId, []) : [];

            let partnerDynamicFields = generateDynamicContent(pro, showInEmailForPartner);
            
            let partnerName = _.get(partner, 'Display_Name__c') || _.get(partner, 'Name') || '';
            let loanAmount = _.get(pro, 'Amount__c', '---') || '---';
            let loanPeriod = _.get(pro, 'Loan_Period__c', '---') || '---';
            // let totalMonthlyPayment = _.get(pro, 'details.Total_monthly_payment__c', '---') || '---';            
            
            offerHtml = offerHtml.replace(/{{partner_name}}/gi, partnerName);
            offerHtml = offerHtml.replace(/{{Loan_amount}}/gi, loanAmount);
            offerHtml = offerHtml.replace(/{{Loan_period}}/gi, loanPeriod);
            // offerHtml = offerHtml.replace(/{{Totalt_kostnad_per_månad}}/gi, totalMonthlyPayment);
            offerHtml = offerHtml.replace(/{{Dynamic_fields}}/gi, partnerDynamicFields);

            allOfferHtml += offerHtml;
        });

        mainHtml = mainHtml.replace(/{{offers_list}}/gi, allOfferHtml);
        
        if (contactEmail) {
            emailsList.push(createMailObject(contactEmail, subject, mainHtml, whatId));
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

function generateDynamicContent(product, showInEmailForPartner) {
    partnerDynamicFields = "";

    showInEmailForPartner.forEach(item => {
        let itemLabel = item.Translated_Label__c;
        let itemUnit = item.Customer_Unit__c;
        let itemApiName = _.get(item, 'API_Name__c', '') + '__c';

        if (_.get(product, ['details', itemApiName])) {
            partnerDynamicFields += '<p style="mso-line-height-rule:exactly; line-height:175%">' + itemLabel + 
                                    ': <strong>' + _.get(product, ['details', itemApiName], '---') + ' ' +
                                    itemUnit + '</strong></p>';
        }
    });

    return partnerDynamicFields;
}


async function callSfSendMailAPI(sfConn, emailsList) {
    let reqBody = {
        emailsList : emailsList
    }

    try {
        let result = await sfConn.apex.post("/sendEmails", reqBody);
        return result;
    } catch (err) {
        logger.error('callSfSendMailAPI', {metadata:{
            err: err,
            reqBody: reqBody
        }});
    }


}

module.exports = {
    callSfSendMailAPI,
    prepareEmailForOfferAcceptance,
    prepareEmailForTrigger2,
    prepareEmailForTriggerActiveOffers,
    prepareOverviewEmailForPartners,
    prepareEmailsForacceptedOfferCancelling,
    callSfSendMailAPI
}