const winston = require("winston");


function APIlogger(req, res, next){
    // override send function
    let temp = res.send;

    res.send = function () {
        // Set res.body
        let resBody = (arguments.length) ? arguments[0] : null;
        res.body = resBody;  

        let data = prepareLogData(req, res);

        try{
            // Just Parse the resbody to check if it would be parsed,so it was logged before
            JSON.parse(resBody);
        } catch (err) {
            logger(data.logLevel, data.reqLog, data.resLog);
        }

        temp.apply(this, arguments);
    }
    return next();
}

function prepareLogData(req,res) {
    let reqLog = {
        url: req.url,
        method: req.method,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body
    }
    , resLog = {
        body: res.body,
        status: res.statusCode
    };

    let logLevel = null;
    if (res.statusCode >= 500) {
        logLevel = 'error';
    } else if (res.statusCode >= 400) {
        logLevel = 'warn';
    } else if (res.statusCode >= 100) {
        logLevel = 'info';
    }

    return {
        logLevel: logLevel,
        reqLog: reqLog,
        resLog: resLog
    };

}

function logger(logLevel, reqLog, resLog) {
    try{
        winston.log(logLevel, 
            reqLog.url,
            {metadata: {
                req: reqLog,
                res: resLog
            }}
        );
    } catch (e) {
        console.log("Error Occured when logging using winston. Error:", e );
    }
}


module.exports = APIlogger;