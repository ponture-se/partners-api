const _ = require('lodash');
const logger = require('./customeLogger');

function prepareEmailsForacceptedOfferCancelling(productsList, perPartnerShowInList) {
    let emailList = [];

    // Note: Example for Customer Email. 
    let emailTo = _.get(productsList, ['0', 'Supplier_Partner_Opportunity__r', 'OpportunityId__r', 'PrimaryContact__r','Email']);
    let emailSubject = 'You Still Have Some Offers for Your Application';
    let emailWhatId = _.get(productsList, ['0', 'Supplier_Partner_Opportunity__r', 'OpportunityId__c']);

    let emailBody = '<html><Body>' +
                            '<div>Hi, Active offers for your application are listed below.</div>' +
                            '<table border="1">'+
                                '<tr>' +
                                    '<td> Partner </td>' +
                                    '<td> Title </td>' +
                                    '<td> Value </td>' +
                                '</tr>';

    productsList.forEach(product => {
        try {
            let partnerId = _.get(product, 'Supplier_Partner_Opportunity__r.SupplierAccountId__r.Organization_Number__c', '');
            let partnerName = _.get(product, 'Supplier_Partner_Opportunity__r.SupplierAccountId__r.Name', '');
            let showInListOfPartner = perPartnerShowInList[partnerId] || [];
            
            emailBody +='<tr>' +
                            '<td> ' + partnerName + '</td>' +
                            '<td> ' + 'Amount' + '</td>' +
                            '<td> ' + _.get(product, 'Amount__c', '-') + '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td> ' + partnerName + '</td>' +
                            '<td> ' + 'Period' + '</td>' +
                            '<td> ' + _.get(product, 'Loan_Period__c', '-') + '</td>' +
                        '</tr>';

            showInListOfPartner.forEach(item => {
                let itemName = item.Name;
                let itemApiName = _.get(item, 'API_Name__c', '') + '__c';

                if (_.get(product, ['details', itemApiName])) {
                    emailBody += '<tr>' +
                                    '<td> ' + partnerName + '</td>' +
                                    '<td> ' + itemName + '</td>' +
                                    '<td> ' + _.get(product, ['details', itemApiName]) + '</td>' +
                                '</tr>';
                }
            });
        } catch(e) {
            logger.error('prepareEmailForProducts Error', {metadata: {
                product: product,
                error: e
            }});
        }
    });

    emailBody += '</table>'+
                '</body></html>';
// todo: use function to prepare email Object
    emailList.push(
        {
            to: emailTo,
            subject: emailSubject,
            body: emailBody,
            whatId: emailWhatId
        }
    );
    
    return emailList;
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
    prepareEmailsForacceptedOfferCancelling,
    callSfSendMailAPI
}