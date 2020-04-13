const _ = require('lodash');
const logger = require('./customeLogger');


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
    callSfSendMailAPI
}