var constants = require('./constants'),
    express = require('express'),
    fs = require('fs'),
    config = require('./config'),
    winston = require('winston'),
    winstonMongoDB = require('winston-mongodb').MongoDB;
winston.add(winston.transports.MongoDB, {
    dbUri: config.db
});
module.exports = function(app) {
    var logErrors = function logErrors(err, req, res, next) {
        console.log(err.stack);
        next(err);
    };
    var clientErrorHandler = function clientErrorHandler(err, req, res, next) {
        if([constants.FAIL_STATUS_CODE].indexOf(err.status) >= 0) {
            var httpErrCode = 500;
            var errorToReturn = {
                status: err.status
            };
            if(typeof err.name !== 'undefined' && err.name !== "Error") {
                if(err.name === constants.ERROR_TYPE_MONGO) {
                    errorToReturn.code = err.code;
                } else if(err.type === constants.ERROR_TYPE_MONGOOSE) {
                    errorToReturn.message = err.message;
                    if( !! err.errors) {
                        switch(err.name) {
                            case constants.ERROR_NAME_VALIDATION:
                                httpErrCode = 400;
                                break;
                        }
                        errorToReturn.errors = err.errors.message;
                    } else if( !! err.code) {
                        errorToReturn.code = err.code;
                        switch(err.code) {
                            case constants.ERROR_CODE_DUPLICATION:
                                // duplication key error
                                httpErrCode = 409;
                                break;
                        }
                    }
                }
            } else {
                errorToReturn.message = err.message;
            }
            res.json(httpErrCode, errorToReturn);
        } else if(constants.UNAUTHORIZED_STATUS_CODE === err.status) {
            res.send(401, err.message);
        } else {
            next(err);
        }
    };
    var serverErrorHandler = function errorHandler(err, req, res, next) {
        winston.log('error', err);
        res.json(500, err);
    };
    if(app.get('env') === 'development') {
        app.use(logErrors);
    }
    app.use(clientErrorHandler);
    app.use(serverErrorHandler);
    process.on('uncaughtException', function(err) {
        // FIXME: use forever or supervisor to restart the server.
        winston.log('error', err);
        console.log(err.stack);
    });
};