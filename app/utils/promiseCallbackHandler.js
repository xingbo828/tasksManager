var constants = require('../../config/constants');

exports.mongooseSuccess = function (req, next) {
    return function (data) {
        if(!data){
            var err = {
            	status: constants.FAIL_STATUS_CODE,
            	errors: new Error('query return empty result')
        	};
        	return next(err);
        }
        req.data = data;
        return next();
    };
};
exports.mongooseFail = function (next) {
    return function (err) {
        err.status = constants.FAIL_STATUS_CODE;
        err.name = constants.ERROR_TYPE_MONGOOSE;
        console.log(err);
        return next(err);
    };
};
