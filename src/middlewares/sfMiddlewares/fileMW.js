const fileController = require('../../controllers/fileController');
const myResponse = require('../../controllers/myResponse');
// const apiLogger = require('../apiLogger');
// const logger = require('../../controllers/customeLogger');
// const multer = require('multer');
const dotenv = require('dotenv');
// const fs = require('fs');
dotenv.config();


async function downloadFile(req, res, next) {
    let resBody;
    let sfConn = req.needs.sfConn;
    let fileId = req.params.fileId;

    // let fileData = await fileController.getContentVersionWithFileId(fileId, sfConn);
    fileId = fileId.split('.')[0];
    let fileData = await fileController.getContentVersionWithCustomFileId(fileId, sfConn);

    if (fileData == null) {
        resBody = myResponse(false, null, 500, 'Can not get file. Please recheck file Id and try again.');
        res.status(500).send(resBody);
        return next();
    } else {
        let fileName = Date.now().toString() + ' ' + fileData.title;

        // let result = 
        try {
            await fileController.downloadFileAsStream(fileData.id, fileName, sfConn, function (err) {
            if (err) {
                resBody = myResponse(false, null, 500, 'downloadFile Func Throw Error', err);
                // logger.error('downloadFile Func Throw Error', {metadata: resBody});
                console.log('downloadFile Func Throw Error', resBody);
    
                res.status(500).send(resBody);
                return next();
            } else {
                let fileAddr = './tempStorage/' + fileName;
                res.status(200).download(fileAddr);
            }
            
            });
        } catch (err) {
            resBody = myResponse(false, null, err.statusCode || 500, err.message, err);
            res.status(resBody.statusCode).send(resBody);
            return next();
        }

        // if (result == false) {
        //     resBody = myResponse(false, null, 403, 'Partners are not allowed to see this file.');
        //     res.status(403).send(resBody);
        //     return next();
        // }
    }

}



module.exports = {
    downloadFile
}