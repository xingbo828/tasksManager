var constants = require('../../config/constants'),
    redis = require("redis").createClient(),
    config = require('../../config/config');
exports.ensureAuthenticated = function(roles) {
    return function(req, res, next) {
        if(req.isAuthenticated()) {
            if( !! roles && roles > req.user.userType) {
                var error = new Error(4012);
                error.status = constants.UNAUTHORIZED_STATUS_CODE;
                return next(error);
            }
            // all user types can access if role is empty
            return next();
        }
        var error = new Error(4011);
        error.status = constants.UNAUTHORIZED_STATUS_CODE;
        return next(error);
    };
}
exports.sendJson = function(req, res, next) {
    var returnData = {
        status: constants.SUCCESS_STATUS_CODE
    };
    if( !! req.data) {
        returnData.data = req.data;
    }
    if( !! req.enableCache) {
        redis.set(req.method + req.url, JSON.stringify(returnData));
        redis.expire(req.method + req.url, config.queryCacheExpire);
    }
    res.json(returnData);
};
exports.readCache = function(req, res, next) {
    var cacheKey = req.method + req.url;
    req.enableCache = true;
    //var expireTimeKey = cacheKey + '-EXPIRE';
    redis.get(cacheKey, function(err, reply) {
        if( !! err) {
            return next(err);
        } else if(reply === null) {
            //key not found
            console.log('\x1B[33mSession expired . Reading data from DB. Process::' + process.pid);
            return next();
        } else {
            console.log('\x1B[32mReading data from cache. Process::' + process.pid);
            res.json(JSON.parse(reply));
        }
    });
};