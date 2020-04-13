const _ = require('lodash');
const logger = require('./customeLogger');



async function callSfSendMailAPI(sfConn, emailsList) {
    console.log("emailsList", emailsList);
    let reqBody = {
        emailsList : emailsList
    }

    let result = await sfConn.apex.post("/sendEmails", reqBody);

    return result;

}

module.exports = {
    prepareEmailForProducts,
    callSfSendMailAPI
}