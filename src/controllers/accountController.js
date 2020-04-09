const myToolkit = require('./myToolkit');
const { salesforceException, typeException } = require('./customeException');
const tBoxCtrl = require('./translationBoxController');
const logger = require('./customeLogger');
const _ = require('lodash');

/**
 * This function return a list of partners' account, with all primitive field.
 * 
 * Plus two objects, namely, Products_Master__r, Partners_Rules__r of that partners if exist.
 * 
 * If each of those object not exist, the value would be null.
 * 
 * otherwise the valus would be an object with these key/valuse: totalSize (int), done (boolean), records (array).
 * 
 * Abbas
 */
async function getAllPartnersAccount(sfConn = null) {
    let result;
    
    // Get Connection If It's not already exist
    if (sfConn == null) {
        sfConn = await myToolkit.makeSFConnection();
        if (sfConn == null) {
            throw new Error('CAN NOT MAKE SF CONNECTION');
        }
    }

    // Get "Supplier Partner" RecordTypeId
    let partnerRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Account', 'Supplier Partner');
    if (partnerRecordTypeId == null) {
        throw new Error('Could not get Supplier Partner Id.');
    }

    try{
        result = await sfConn.sobject('Account')
                                .select('*')
                                .where({
                                    recordTypeId: partnerRecordTypeId
                                })
                                .include('Products_Master__r')
                                .end()
                                .include('Partners_Rules__r')
                                .end()
                                .execute();   
    } catch (err) {
        logger.error('getAllPartnersAccount function error', {metadata: err});
        throw new salesforceException('Error getting Partners Data From SF.', err, 500);        
    }	
    
    return result;
}

/**
 * This function return a list of Active partners' account, with all primitive field.
 * 
 * Plus two objects, namely, Products_Master__r, Partners_Rules__r of that partners if exist.
 * 
 * @param{object} partnerList - A List of Partners with at least: orgNumber, Partner_Rules, Product_Master
 * 
 * Abbas
 */
function extractActivePartners(partnerList) {
    let activePartners = [];
    
    for(let index in partnerList) {
        let partnerId = partnerList[index].Organization_Number__c;
        let partnerRules = partnerList[index].Partners_Rules__r;
        let productMaster = partnerList[index].Products_Master__r;

        if (partnerId != null && partnerId.trim() != '' &&
            partnerRules != null && partnerRules.totalSize != null && partnerRules.totalSize > 0 && partnerRules.records != null && _.size(partnerRules) > 0 &&
            productMaster != null && productMaster.totalSize != null && productMaster.totalSize > 0 && productMaster.records != null && _.size(productMaster) > 0) {
                activePartners.push(partnerList[index]);
            }

    }

    return activePartners;
}

async function getPartnersTranslationBoxByCobjName(cObjNamesList, sfConn = null) {
    let lang = 'sv';
    let trMap = {};

    if (!Array.isArray(cObjNamesList)) {
        throw new typeException('cObjNamesList should be Array');
    }

    sfConn = (sfConn) ? sfConn : await myToolkit.makeSFConnection();
    if (sfConn == null) {
        throw new Error('CAN NOT MAKE SF CONNECTION');
    }
    
    
    for (let i in cObjNamesList) {
        let cObjName = cObjNamesList[i];
        try{

            let trList = await tBoxCtrl.getSinglePartnerTranslationBox(cObjName, lang, sfConn);
            trMap[cObjName] = {
                success: true,
                result: trList
            };

        } catch (err) {

            trMap[cObjName] = {
                success: false
            };

        }
    }

    return trMap;
}


module.exports = {
    getAllPartnersAccount,
    extractActivePartners,
    getPartnersTranslationBoxByCobjName
}