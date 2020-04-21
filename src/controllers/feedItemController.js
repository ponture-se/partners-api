const myToolkit = require('./myToolkit');
const jsforce = require('jsforce');
const _ = require('lodash');
const logger = require('./customeLogger');
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


function filterSpecificTrackChangeFeeds(feedItemList, fieldName, oldVal, newVal) {
    let filteredFeeds = _.filter(feedItemList, o => {
        let trackFeeds = _.get(o, 'FeedTrackedChanges.records');

        filteredTrackFeeds = _.filter(trackFeeds, trackObj => {
            let fName = _.get(trackObj, 'FieldName', '').toLowerCase();
            let oldValue = _.get(trackObj, 'OldValue', '').toLowerCase();
            let newValue = _.get(trackObj, 'NewValue', '').toLowerCase();

            if (fName.includes(fieldName.toLowerCase()) &&
                (!oldVal || oldValue == oldVal.toLowerCase()) &&
                (!newVal || newValue == newVal.toLowerCase())) {
                return true;
            }
        });
        if (_.size(filteredTrackFeeds) > 0) {
            return true;
        }
    });

    return filteredFeeds;

}


module.exports = {
    getFeedTrackItems,
    filterSpecificTrackChangeFeeds
}