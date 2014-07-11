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
var _saveOrUpdateTask = function (req, res, next, taskId) {
    var summary = req.body.summary,
        description = req.body.description,
        location = req.body.location,
        taskDoneDate = req.body.taskDoneDate,
        category = req.body.category,
        taskType = req.body.taskType;
        //validations
    if(!!taskDoneDate && !moment(taskDoneDate).isValid()) {
        //TODO :: Add seconds to the constants file  || moment(taskDoneDate).unix() <= moment().add("seconds", 60*60*2).unix()
        var err = {
            status: constants.FAIL_STATUS_CODE,
            errors: new Error('Invalid date')
        };
        return next(err);
    }
    var config = (function(){
        var temp = {
            summary: summary,
            description: description,
            location: location,
            taskDoneDate: new Date(taskDoneDate),
            _category: category,
            _owner: req.user._id
		};
        if(taskType === constants.TASK_TYPES.DELIVERY){
            _.extend(temp, {
                locationFrom : req.body.locationFrom,
                locationTo : req.body.locationTo
            });
        }
        else if(taskType === constants.TASK_TYPES.VIRTUAL){
        }
        
       return  _.each(temp, function(value, key){
            if(typeof value === 'undefined'){
               delete temp[key];
            }
        });
       
    }());
    

    
    //New task
    if(!taskId) {
		if(taskType === constants.TASK_TYPES.IN_PERSON){
            var newInPersonTask = new InPersonTask(config);
			newInPersonTask.save(function (err, data) {
                if(err) {
                    promiseCallbackHandler.mongooseFail(next)(err);
                } else {
                    promiseCallbackHandler.mongooseSuccess(req, next)(data);
                }
			});
        }
        else if(taskType === constants.TASK_TYPES.DELIVERY){
            var newDeliveryTask = new DeliveryTask(config);
			newDeliveryTask.save(function (err, data) {
                if(err) {
                    promiseCallbackHandler.mongooseFail(next)(err);
                } else {
                    promiseCallbackHandler.mongooseSuccess(req, next)(data);
                }
			});
        }
        else if(taskType === constants.TASK_TYPES.VIRTUAL){
            //TODO
        }
        //TODO :: log type not found error
    } 
    
    //Update existing task
    else {
        var promise;
        if(taskType === constants.TASK_TYPES.IN_PERSON){
            promise = InPersonTask.findOneAndUpdate({
                _id: new ObjectId(taskId),
                _owner: new ObjectId(req.user._id),
                _type: taskType
            }, config)
            .exec();
        }
        else if(taskType === constants.TASK_TYPES.DELIVERY){
            promise = DeliveryTask.findOneAndUpdate({
                _id: new ObjectId(taskId), 
                _owner: new ObjectId(req.user._id),
                _type: taskType
            }, config)
            .exec();
        }
        else if(taskType === constants.TASK_TYPES.VIRTUAL){
            //TODO
        }
        promise.then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
    }
};


var _deleteTask = function (req, res, next) {
    var taskId = req.body.taskId;
        InPersonTask.findOneAndRemove({_id: new ObjectId(taskId), _owner: new ObjectId(req.user._id)})
        .exec()
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
//End of shared methods


//Start of in person task
exports.addInPersonTask = function (req, res, next) {
    _saveOrUpdateTask(req, res, next);
};


exports.updateInPersonTask = function (req, res, next) {
    var taskId = req.body.taskId;
    if(!taskId) {
        var err = {
            status: constants.FAIL_STATUS_CODE,
            errors: new Error('Unable to find task ID')
        };
        return next(err);
    }
    _saveOrUpdateTask(req, res, next, taskId);
};

exports.deleteInPersonTask = function(req, res, next) {
    _deleteTask(req, res, next);
};

exports.getInPersonTasks = function (req, res, next) {
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
	_saveOrUpdateTask(req, res, next);
};

exports.updateDeliveryTask = function(req, res, next) {
	var taskId = req.body.taskId;
    if(!taskId) {
        var err = {
            status: constants.FAIL_STATUS_CODE,
            errors: new Error('Unable to find task ID')
        };
        return next(err);
    }
    _saveOrUpdateTask(req, res, next, taskId);
};

exports.deleteDeliveryTask = function(req, res, next) {
	_deleteTask(req, res, next);
};

exports.getDeliveryTasks = function (req, res, next) {
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
exports.getMyTasks = function (req, res, next) {
    Task.find({_owner: new ObjectId(req.user._id)})
    .exec()
    .then(
         promiseCallbackHandler.mongooseSuccess(req, next), 
         promiseCallbackHandler.mongooseFail(next)
     );
};
//End of my tasks



