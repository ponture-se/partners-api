const myToolkit = require('./myToolkit');
const queryHelper = require('./sfHelpers/queryHelper');
// const fResult = require('./functionResult');
// const _ = require("lodash");
// const crudHelper = require('./sfHelpers/crudHelper');
// const mime = require('mime-types');
// const { salesforceException, externalCalloutException } = require('./customeException');
const fs = require('fs');
// const mlog = require('./customeLogger');
// const axios = require('axios');
// const logger = require('./customeLogger');


async function getContentVersionWithFileId(fileId, sfConn = undefined){
    try{
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }

        let where = {Id : fileId};

        let cvItem = await queryHelper.getSingleQueryResult(sfConn, "ContentVersion", where);
        let cvsInfo = {
                            cdId: cvItem.ContentDocumentId,
                            id : cvItem.Id,
                            title : cvItem.Title,
                            fileExtension : cvItem.FileExtension,
                            content: cvItem.VersionData
                        };
        
        return cvsInfo;
    } catch(e) {
        console.log("getContentVersionWithFileId:", e);
        return null;
    }
}



async function downloadFileAsStream(fileId, fileName, sfConn, callback) {
    // body payload structure is depending to the Apex REST method interface.
    var param = "?id=" + fileId;
    let result;
    let permissionFor;
    try {
        result = await sfConn.apex.get("/getFile" + param);
        permissionFor = (result.data.for) ? result.data.for.toLowerCase() : null;
        if (permissionFor == 'partner' || permissionFor == 'all') {

            fs.mkdir('./tempStorage/', { recursive: true }, (err) => {
                if (err) throw err;
            });
            
            fs.writeFile('./tempStorage/' + fileName, result.data.content, {encoding: 'base64'}, callback);
            
            return true;
        } else {
            return false;
        }

    } catch (err) {
        // logger.error('downloadFileAsStream Error', { metadata: err });
        console.log('downloadFileAsStream Error', err);
    }

}


module.exports = {
    getContentVersionWithFileId,
    downloadFileAsStream
}