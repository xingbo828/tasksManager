var constants = require('../../config/constants');
exports.newFailedError = function (msg) {
    var err = new Error(msg);
    err.status = constants.FAIL_STATUS_CODE;
    return err;
};