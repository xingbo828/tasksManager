var constants = require('../../config/constants');
exports.newFailedError = function (msg, httpCode, statusCode) {
    var err = new Error(msg);
    err.status = constants.FAIL_STATUS_CODE;
    if(!!httpCode){
    	err.httpErrCode = httpCode;
    }
    if(!!statusCode){
    	err.status = statusCode;
    }

    return err;
};