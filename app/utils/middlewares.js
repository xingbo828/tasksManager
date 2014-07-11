var constants = require('../../config/constants'),
    redis = require("redis").createClient(),
    config = require('../../config/config');

exports.ensureAuthenticated = function (req, res, next) {
    
    // TODO: Add proper error handling for unauthorized or should it be an error?
    if(req.isAuthenticated()) {
        return next();
    }
    var error = new Error("Unauthorized");
    error.status = constants.UNAUTHORIZED_STATUS_CODE;
    next(error);
};
exports.sendJson = function (req, res, next) {
    var returnData = {
        status: constants.SUCCESS_STATUS_CODE
    };
    if(!!req.data){
        returnData.data = req.data;
    }
    if(!!req.enableCache){
        redis.set(req.method + req.url, JSON.stringify(returnData));  
        redis.expire(req.method + req.url, config.queryCacheExpire);
    }
    res.json(returnData);
};

exports.readCache = function(req, res, next){
    var cacheKey = req.method + req.url;
    req.enableCache = true;
    //var expireTimeKey = cacheKey + '-EXPIRE';
    redis.get(cacheKey, function(err, reply){
        if(!!err){
            return next(err);
        }
        else if(reply === null){
            //key not found
            console.log('\x1B[33mSession expired . Reading data from DB. Process::'+ process.pid);
            return next();
        }
        else{
            console.log('\x1B[32mReading data from cache. Process::' + process.pid);
           res.json(JSON.parse(reply));
        }
    });
};