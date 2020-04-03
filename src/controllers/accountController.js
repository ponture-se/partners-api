const myToolkit = require('./myToolkit');
const { salesforceException } = require('./customeException');
const logger = require('./customeLogger');

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
        throw new Error('Could not get Supplier Partnet Id.');
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


module.exports = {
    getAllPartnersAccount
}