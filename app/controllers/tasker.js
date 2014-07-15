var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    promiseUtil = require('../utils/promise'),
    User = mongoose.model('User'),
    Tasker = mongoose.model('Tasker'),
    ObjectId = mongoose.Types.ObjectId;
var _saveOrUpdateTasker = function(body) {
    return promiseUtil.newPromise(function() {
        var config = {
            city: body.city,
            bio: body.bio,
            hasVehicle: body.hasVehicle
        };
        return _.each(config, function(value, key) {
            if (typeof value === 'undefined') {
                delete temp[key];
            }
        });
    });
};
exports.addTasker = function(req, res, next) {
    // create supports promise while save only support promise on the latest version
    var createTasker = function(config) {
        return Tasker.create(config);
    }

    var updateUserRef = function(data) {
        return User.findOneAndUpdate({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }, {
            _tasker: data._id
        }).exec();
    }

    _saveOrUpdateTasker(req.body)
        .then(createTasker)
        .then(updateUserRef)
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};


exports.updateTasker = function(req, res, next) {

    var getUser = function() {
        return User.findOne({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }).exec();
    }

    var updateTasker = function(config, user) {
        var taskerId = user._tasker;
        return Tasker.findOneAndUpdate({
            _id: new ObjectId(taskerId)
        }, config).exec();
    };

    _saveOrUpdateTasker(req.body)
        .then(function(config) {
            // bind the partial function since mpromise doens't support .all() to get both user and config at the same time
            updateTasker = updateTasker.bind(null, config);
        })
        .then(getUser)
        .then(function(user){
            // extra anonymous function to make sure partial function is evaluated just before it gets called.
            return updateTasker(user);
        })
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};

exports.deleteTasker = function(req, res, next) {

    var updateUser = User.findOneAndUpdate({
        _id: new ObjectId(req.user._id),
        status: constants.USER_STATUS.ACTIVE
    }, {
        userType: constants.USER_TYPE.STANDARD
    }).exec();

    var deleteTasker = function(user) {
        var taskerId = user._tasker;
        return Tasker.findOneAndUpdate({
            _id: new ObjectId(taskerId)
        }, {
            status: constants.USER_STATUS.DELETED
        }).exec();
    };

    updateUser
        .then(deleteTasker)
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
exports.getTasker = function(req, res, next) {
    var id = req.params.id;
    User
        .find({
            _id: new ObjectId(id)
        })
        .populate('_tasker')
        .select('nickName email capableTask')
        .where()
        .exec()
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
exports.getTaskers = function(req, res, next) {};