var constants = require('../../config/constants'),
    errUtil = require('../utils/error'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    _ = require('underscore'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    Task = mongoose.model('Task'),
    ObjectId = mongoose.Types.ObjectId;


//Begin of shared methods
var _saveOrUpdateTask = function(req, res, next, cb) {
    var summary = req.body.summary,
        description = req.body.description,
        taskDoneDate = req.body.taskDoneDate,
        category = req.body.category,
		location = req.body.location;
    //validations
    if (!!taskDoneDate && !moment(taskDoneDate).isValid()) {
        //TODO :: Add seconds to the constants file  || moment(taskDoneDate).unix() <= moment().add("seconds", 60*60*2).unix()
        return next(errUtil.newFailedError('Invalid date'));
    }
    var config = (function() {
        var temp = {
            summary: summary,
            description: description,
            taskDoneDate: new Date(taskDoneDate),
            _category: category,
            _owner: req.user._id,
            location: location
        };

        return _.each(temp, function(value, key) {
            if (typeof value === 'undefined') {
                delete temp[key];
            }
        });

    }());

    cb(config);

};

//End of shared methods


//Start of in person task
exports.addTask = function(req, res, next) {
    _saveOrUpdateTask(req, res, next, function(config) {
        var newTask = new Task(config);
        newTask.save(function(err, data) {
            if (err) {
                promiseCallbackHandler.mongooseFail(next)(err);
            } else {
                req.httpCode = 201;
                promiseCallbackHandler.mongooseSuccess(req, next)(data);
            }
        });
    });
};


exports.updateTask = function(req, res, next) {
    var taskId = req.body.taskId;
    if (!taskId) {
        return next(errUtil.newFailedError('Unable to find task ID'));
    }
    _saveOrUpdateTask(req, res, next, function(config) {
        promise = Task.findOneAndUpdate({
            _id: new ObjectId(taskId),
            _owner: new ObjectId(req.user._id)
        }, config)
            .exec();
            promise.then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
    });
};

exports.rejectTask = function(req, res, next) {
    var taskId = req.params.id;
    Task.findOneAndUpdate({
        _id: new ObjectId(taskId),
        _tasker: new ObjectId(req.user._id)
    }, {status: constants.TASK_STATUS.REJECTED}).exec()
    .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};

exports.deleteTask = function(req, res, next) {
    var taskId = req.params.id;
    Task.findOneAndUpdate({
        _id: new ObjectId(taskId),
        _owner: new ObjectId(req.user._id)
    },{status: constants.TASK_STATUS.DELETED})
        .exec()
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};




//Begin of my tasks
exports.getTasks = function(req, res, next) {
    Task.find({
        _owner: new ObjectId(req.user._id),
        status: {$nin : [constants.TASK_STATUS.DELETED, constants.TASK_STATUS.INACTIVE]}
    })
        .exec()
        .then(
            promiseCallbackHandler.mongooseSuccess(req, next),
            promiseCallbackHandler.mongooseFail(next)
    );
};
//End of my tasks
