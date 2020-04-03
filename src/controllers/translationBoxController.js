// const queryHelper = require('./sfHelpers/queryHelper');
const myToolkit = require('./myToolkit');
const logger = require('./customeLogger');

async function getSinglePartnerTranslationBox(cObjName, lang, sfConn = null) {
    sfConn = (sfConn) ? sfConn : await myToolkit.makeSFConnection();
    if (sfConn == null) {
        throw new Error('CAN NOT MAKE SF CONNECTION');
    }

    let whereClause = {
        PartnerId__c: cObjName,
        Lang__c: lang
    }

    try {
        let result = await sfConn.sobject('Translation_Box__c')
                                    .select('*')
                                    .where(whereClause)
                                    .execute();
        return result;
    } catch (err) {
        logger.error('getSinglePartnerTranslationBox Error',
        {metadata: {
            error: err,
            inputs: {
                cObjName: cObjName,
                lang: lang
            }
        }
        });
        throw err;
    }
    
}


module.exports = {
    getSinglePartnerTranslationBox
}