var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    User = mongoose.model('User'),
    Tasker = mongoose.model('Tasker'),
    ObjectId = mongoose.Types.ObjectId;
var _saveOrUpdateTasker = function(req, res, next, cb) {
    var config = (function() {
        var temp = {
            city: req.body.city,
            bio: req.body.bio,
            hasVehicle: req.body.hasVehicle
        };
        return _.each(temp, function(value, key) {
            if (typeof value === 'undefined') {
                delete temp[key];
            }
        });
    }());
    cb(config);
};
exports.addTasker = function(req, res, next) {
    _saveOrUpdateTasker(req, res, next, function(config) {
        var newTasker = new Tasker(config);
        newTasker.save(function(err, data) {
            if (err) {
                promiseCallbackHandler.mongooseFail(next)(err);
            } else {
                User.findOneAndUpdate({
                    _id: new ObjectId(req.user._id),
                    status: constants.USER_STATUS.ACTIVE
                }, {
                    _tasker: data._id
                }).exec().then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
            }
        });
    });
};


exports.updateTasker = function(req, res, next) {
    _saveOrUpdateTasker(req, res, next, function(config) {
        config.capableTask = req.body.capableTask;
        config.availability = req.body.availability;

        var getUser = User.findOne({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }).exec();

        var findTasker = function(user) {

            var taskerId = user._tasker;
            return Tasker.findOneAndUpdate({
                _id: new ObjectId(taskerId)
            }, config).exec();
        };

        getUser
            .then(updateTasker)
            .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
    });
};

exports.deleteTasker = function(req, res, next) {
    _saveOrUpdateTasker(function(config) {

        var updateUser = User.findOneAndUpdate({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }, {
            userType: constants.USER_TYPE.STANDARD
        }).exec();

        var updateTasker = function(user) {
            var taskerId = user._tasker;
            return Tasker.findOneAndUpdate({
                _id: new ObjectId(taskerId)
            }, {
                status: constants.USER_STATUS.DELETED
            }).exec();
        };

        updateUser
            .then(updateTasker, promiseCallbackHandler.mongooseFail(next))
            .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));

    });
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