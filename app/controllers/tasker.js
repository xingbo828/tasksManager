var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    errUtil = require('../utils/error'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    when = require('when'),
    promiseUtil = require('../utils/promise'),
    User = mongoose.model('User'),
    Tasker = mongoose.model('Tasker'),
    Category = mongoose.model('Category'),
    ObjectId = mongoose.Types.ObjectId;
var _saveOrUpdateTasker = function(body) {
    return promiseUtil.newPromise(function() {
        var config = {
            city: body.city,
            bio: body.bio,
            hasVehicle: body.hasVehicle
        };
        return _.each(config, function(value, key) {
            if(typeof value === 'undefined') {
                delete config[key];
            }
        });
    });
};
exports.addTasker = function(req, res, next) {
    // create() returns promise and save() only returns promise on the latest mongoose version
    var createTasker = function(config) {
        return Tasker.create(config);
    };
    var updateUserRef = function(data) {
        return User.findOneAndUpdate({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }, {
            _tasker: data._id,
            userType: constants.USER_TYPE.TASKER
        }).exec();
    };
    req.httpCode = 201;
    _saveOrUpdateTasker(req.body).then(createTasker).then(updateUserRef).then(promiseCallbackHandler.mongooseSuccess(req, next)).end(promiseCallbackHandler.mongooseFail(next));
};
exports.updateTasker = function(req, res, next) {
    var getUser = User.findOne({
        _id: new ObjectId(req.user._id),
        status: constants.USER_STATUS.ACTIVE
    }).exec();
    var updateTasker = function(data) {
        var config = data[0];
        var user = data[1];
        if( !! req.body.capableTask) {
            config.capableTask = req.body.capableTask;
        }
        if( !! req.body.availability) {
            config.availability = req.body.availability;
        }
        if(!user._tasker) {
            throw errUtil.newFailedError("Not a tasker", 401);;
        }
        return Tasker.findOneAndUpdate({
            _id: new ObjectId(user._tasker),
            status: constants.USER_STATUS.ACTIVE
        }, config).exec();
    };
    var checkUpdate = function(data) {
        if(!data || !Object.keys(data).length) {
            throw errUtil.newFailedError("Not a tasker", 401);
        }
        return data;
    };
    when.all([_saveOrUpdateTasker(req.body), getUser]).then(updateTasker).then(checkUpdate).then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
exports.deleteTasker = function(req, res, next) {
    var originUserType;
    var updateUser = User.findOneAndUpdate({
        _id: new ObjectId(req.user._id),
        status: constants.USER_STATUS.ACTIVE
    }, {
        userType: constants.USER_TYPE.STANDARD
    }).exec();
    var deleteTasker = function(user) {
        if(!user) {
            throw errUtil.newFailedError('Unable to find user', 400);
        }
        var taskerId = user._tasker;
        originUserType = user.userType;
        return Tasker.findOneAndUpdate({
            _id: new ObjectId(taskerId)
        }, {
            status: constants.USER_STATUS.DELETED
        }).exec();
    };
    var revertChangeToUser = function(err) {
        if( !! originUserType) {
            User.findOneAndUpdate({
                _id: new ObjectId(req.user._id)
            }, {
                userType: originUserType
            }).exec();
        }
        promiseCallbackHandler.mongooseFail(next)(err);
    };
    var checkUpdate = function(data) {
        if(!data || !Object.keys(data).length) {
            throw errUtil.newFailedError("Not a tasker", 401);
        }
        return data;
    };
    updateUser.then(deleteTasker).then(checkUpdate).then(promiseCallbackHandler.mongooseSuccess(req, next)).end(revertChangeToUser);
};
exports.getTasker = function(req, res, next) {
    var id = req.params.id;
    var userPromise = User.findOne({
        _id: new ObjectId(id)
    }).lean().select('_tasker nickName email').populate({
        path: '_tasker',
        match: {
            status: {
                $nin: [constants.USER_STATUS.SUSPENDED, constants.USER_STATUS.DELETED]
            }
        }
    }).exec();
    var populateCategory = function(user) {
        if(!user) {
            throw errUtil.newFailedError('No such tasker', 200);
        }
        return Category.populate(user, {
            path: '_tasker.capableTask._categoryId'
        });
    };
    userPromise.then(populateCategory).then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
_getTaskers = function() {
    var userPromise = User.find({}).lean().select('_id _tasker nickName email userType').populate({
        path: '_tasker',
        match: {
            status: {
                $nin: [constants.USER_STATUS.SUSPENDED, constants.USER_STATUS.DELETED]
            }
        }
    }).exec();
    var populateCategory = function(user) {
        if(!user) {
            throw errUtil.newFailedError('No such tasker', 200);
        }
        return Category.populate(user, {
            path: '_tasker.capableTask._categoryId',
            select: 'name',
            match: {
                active: true
            }
        });
    };
    return userPromise.then(populateCategory);
};
exports.getTaskers = function(req, res, next) {
    _getTaskers().then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next))
}
exports.filter = function(req, res, next) {
    var filterCategory = Category.find({
        active: true,
        name: new RegExp(".*" + req.query.query + ".*", 'i')
    }).exec();
    var filterTaskers = function(data) {
        var categories = data[0];
        var taskers = data[1];
        if(categories.length === 0) {
            return {taskers: [], categories: []};
        }
        var result = {};

        result.taskers = taskers.filter(function(element) {
            if(!element._tasker){
                return false;
            }
            return element._tasker.capableTask.some(function(task) {
                return task._categoryId._id.equals(categories[0]._id);
            });
        });
        result.categories = categories;
        return result;
    }
    when.all([filterCategory, _getTaskers()]).then(filterTaskers).then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
}