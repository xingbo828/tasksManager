var path = require('path'),
    config = require('./config');



module.exports = Object.freeze({
    SUCCESS_STATUS_CODE: 0,
    FAIL_STATUS_CODE: 1,
    SYSTEM_ERROR_CODE:2,
    UNAUTHORIZED_STATUS_CODE: 401,
    SECRET: '13B96877A1A5A0D27BF10452767D38E09B889CE073A77FF95767892C72C9B359',
    ERROR_TYPE_MONGOOSE : 'Mongoose',
    ERROR_TYPE_MONGO: 'MongoError',
    TASK_TYPES: {
        BASE:'Task',
        IN_PERSON: 'InPersonTask',
        DELIVERY: 'DeliveryTask',
        VIRTUAL: 'VirtualTask'
    }
});