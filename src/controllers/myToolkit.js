const jsforce = require('jsforce');
const dotenv = require('dotenv');

dotenv.config();


async function getRecordTypeId(sfConn, sObjName, recordTypeName){
    let result;
    
    try{
        let sObjDescribe = await sfConn.sobject(sObjName).describe();
        let recordTypesList = sObjDescribe.recordTypeInfos;
        result = recordTypesList.find(o => o.name === recordTypeName).recordTypeId;
    } catch(err) {
        result = null;
    }

    return result;
}


function addPairToReqNeeds(req, key, value){
    if (req.hasOwnProperty('needs')){
        req.needs[key] = value;
    } else {
        req.needs = {};
        req.needs[key] = value;
    }
    return;
}


async function makeSFConnection(){
    const conn = new jsforce.Connection({loginUrl : process.env.LOGIN_API_ROOT,
                                        clientId : process.env.SALESFORCE_CLIENTID,
                                        clientSecret: process.env.SALESFORCE_CLIENT_SECRET});

    try{
        const sfConnection = await conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD);
        return conn;
    } catch (err) {
        console.log(err);
        return null;
    }
}



module.exports = {
    addPairToReqNeeds,
    makeSFConnection,
    getRecordTypeId
}