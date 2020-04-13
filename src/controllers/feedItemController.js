const myToolkit = require('./myToolkit');
const jsforce = require('jsforce');
const _ = require('lodash');
const {
    inputValidationException
} = require('./customeException');



async function getFeedTrackItems(sfConn, whereClause) {
    // Prepare parentId list for query
    let result = await sfConn.sobject('FeedItem')
        .select('*')
        .include('FeedTrackedChanges')
        .end()
        .where(whereClause)
        .execute();


    return result;
}



module.exports = {
    getFeedTrackItems
}