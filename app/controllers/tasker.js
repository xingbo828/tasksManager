/**
 * Created with appoint.me.
 * User: xingbo828
 * Date: 2014-07-12
 * Time: 06:56 AM
 * To change this template use Tools | Templates.
 */
var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    User = mongoose.model('User'),
    Tasker = mongoose.model('Tasker'),
    ObjectId = mongoose.Types.ObjectId;
var _saveOrUpdateTasker = function (req, res, next, cb) {
    isNewTasker = isNewTasker || false;
    var config = (function () {
        var temp = {
            city: req.body.city,
            bio: req.body.bio,
            hasVehicle: req.body.hasVehicle
        };
        return _.each(temp, function (value, key) {
            if(typeof value === 'undefined') {
                delete temp[key];
            }
        });
    }());
    //newTasker = User.tasker.create(config);
    cb(config);
};
exports.addTasker = function (req, res, next) {
    _saveOrUpdateTasker(req, res, next, function (config) {
        var newTasker = new Tasker(config);
        newTasker.save(function (err, data) {
            if(err) {
                promiseCallbackHandler.mongooseFail(next)(err);
            } else {
                //promiseCallbackHandler.mongooseSuccess(req, next)(data);
                User.findOneUpdate({
                    _id: new ObjectId(req.user._id)
                }, {
                    _tasker: data._id
                }).exec().then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
            }
        });
    });
};


exports.updateTasker = function (req, res, next) {
    _saveOrUpdateTasker(function (config) {
        config.capableTask = req.body.capableTask;
        config.availability = req.body.availability;
        
        var taskerPromise;
        var userPromise = User.findOne({
            _id: new ObjectId(req.user._id)
        }).exec();
        var findTasker = function (user) {
            var taskerId = user._tasker;
            taskerPromise = Tasker.findOneUpdate({_id: new ObjectId(taskerId)}, config).exec();
        };

        userPromise.then(findTasker, promiseCallbackHandler.mongooseFail(next));
        taskerPromise.then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
    });
};
exports.deleteTasker = function (req, res, next) {
    _saveOrUpdateTasker(function (config) {
        
        var taskerPromise;
        var userPromise = User.findOne({
            _id: new ObjectId(req.user._id)
        }).exec();
        var findTasker = function (user) {
            var taskerId = user._tasker;
            taskerPromise = Tasker.findOneUpdate({_id: new ObjectId(taskerId)}, {status: 1}}).exec();
        };

        userPromise.then(findTasker, promiseCallbackHandler.mongooseFail(next));
        taskerPromise.then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
exports.getTasker = function (req, res, next) {};
exports.getTaskers = function (req, res, next) {};