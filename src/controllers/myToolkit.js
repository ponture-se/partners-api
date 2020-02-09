function addPairToReqNeeds(req, key, value){
    if (req.hasOwnProperty('needs')){
        req.needs[key] = value;
    } else {
        req.needs = {};
        req.needs[key] = value;
    }
    return;
}




module.exports = {
    addPairToReqNeeds
}