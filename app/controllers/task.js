var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    _ = require('underscore'),
    middleWares = require('../utils/middlewares'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    Task = mongoose.model('Task'),
    InPersonTask = mongoose.model('InPersonTask'),
    DeliveryTask = mongoose.model('DeliveryTask'),
    ObjectId = mongoose.Types.ObjectId;



//Begin of shared methods
var _saveOrUpdateTask = function(req, res, next, cb) {
    var summary = req.body.summary,
        description = req.body.description,
        taskDoneDate = req.body.taskDoneDate,
        category = req.body.category,
        taskType = req.body.taskType;
    //validations
    if (!!taskDoneDate && !moment(taskDoneDate).isValid()) {
        //TODO :: Add seconds to the constants file  || moment(taskDoneDate).unix() <= moment().add("seconds", 60*60*2).unix()
        var err = {
            status: constants.FAIL_STATUS_CODE,
            errors: new Error('Invalid date')
        };
        return next(err);
    }
    var config = (function() {
        var temp = {
            summary: summary,
            description: description,
            taskDoneDate: new Date(taskDoneDate),
            _category: category,
            _owner: req.user._id
        };

        return _.each(temp, function(value, key) {
            if (typeof value === 'undefined') {
                delete temp[key];
            }
        });

    }());

    cb(config);

};


var _deleteTask = function(req, res, next) {
    var taskId = req.params.id;
    Task.findOneAndRemove({
        _id: new ObjectId(taskId),
        _owner: new ObjectId(req.user._id)
    })
        .exec()
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
//End of shared methods


//Start of in person task
exports.addInPersonTask = function(req, res, next) {
    var location = req.body.location;

    _saveOrUpdateTask(req, res, next, function(config) {
        _.extend(config, {
            location: location
        });
        var newInPersonTask = new InPersonTask(config);
        newInPersonTask.save(function(err, data) {
            if (err) {
                promiseCallbackHandler.mongooseFail(next)(err);
            } else {
                promiseCallbackHandler.mongooseSuccess(req, next)(data);
            }
        });
    });
};


exports.updateInPersonTask = function(req, res, next) {
    var taskId = req.body.taskId;
    var location = req.body.location;
    var taskType = constants.TASK_TYPES.IN_PERSON;
    if (!taskId) {
        var err = {
            status: constants.FAIL_STATUS_CODE,
            errors: new Error('Unable to find task ID')
        };
        return next(err);
    }
    _saveOrUpdateTask(req, res, next, function(config) {
        _.extend(config, {
            location: location
        });
        promise = InPersonTask.findOneAndUpdate({
            _id: new ObjectId(taskId),
            _owner: new ObjectId(req.user._id),
            _type: taskType
        }, config)
            .exec();
            promise.then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
    });
};

exports.deleteInPersonTask = function(req, res, next) {
    _deleteTask(req, res, next);
};

exports.getInPersonTasks = function(req, res, next) {
    InPersonTask.find().where('_type').equals(constants.TASK_TYPES.IN_PERSON).populate({
        path: '_owner',
        select: 'email nickName userType',
        match: {
            active: true
        }
    })
        .exec()
        .then(
            promiseCallbackHandler.mongooseSuccess(req, next),
            promiseCallbackHandler.mongooseFail(next)
    );
};
//End of in person task



//Begin of delivery task
exports.addDeliveryTask = function(req, res, next) {
    var locationFrom = req.body.locationFrom,
        locationTo = req.body.locationTo;

    _saveOrUpdateTask(req, res, next, function(config) {
        _.extend(config, {
            locationFrom: locationFrom,
            locationTo: locationTo
        });
        var newDeliveryTask = new DeliveryTask(config);
        newDeliveryTask.save(function(err, data) {
            if (err) {
                promiseCallbackHandler.mongooseFail(next)(err);
            } else {
                promiseCallbackHandler.mongooseSuccess(req, next)(data);
            }
        });
    });

};

exports.updateDeliveryTask = function(req, res, next) {
    var locationFrom = req.body.locationFrom,
        locationTo = req.body.locationTo;
    var taskId = req.body.taskId;
    var taskType = constants.TASK_TYPES.DELIVERY;

    if (!taskId) {
        var err = {
            status: constants.FAIL_STATUS_CODE,
            errors: new Error('Unable to find task ID')
        };
        return next(err);
    }
    _saveOrUpdateTask(req, res, next, function(config) {
        _.extend(config, {
            locationFrom: locationFrom,
            locationTo: locationTo
        });
        promise = DeliveryTask.findOneAndUpdate({
            _id: new ObjectId(taskId),
            _owner: new ObjectId(req.user._id),
            _type: taskType
        }, config)
            .exec();
        promise.then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
    });
};

exports.deleteDeliveryTask = function(req, res, next) {
    _deleteTask(req, res, next);
};

exports.getDeliveryTasks = function(req, res, next) {
    DeliveryTask.find().where('_type').equals(constants.TASK_TYPES.DELIVERY).populate({
        path: '_owner',
        select: 'email nickName userType',
        match: {
            active: true
        }
    })
        .exec()
        .then(
            promiseCallbackHandler.mongooseSuccess(req, next),
            promiseCallbackHandler.mongooseFail(next)
    );
};
//End of delivery task

//Begin of my tasks
exports.getMyTasks = function(req, res, next) {
    Task.find({
        _owner: new ObjectId(req.user._id)
    })
        .exec()
        .then(
            promiseCallbackHandler.mongooseSuccess(req, next),
            promiseCallbackHandler.mongooseFail(next)
    );
};
//End of my tasks