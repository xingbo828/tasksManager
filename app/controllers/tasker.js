var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
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
            if (typeof value === 'undefined') {
                delete temp[key];
            }
        });
    });
};

exports.addTasker = function(req, res, next) {
    // create() returns promise and save() only returns promise on the latest mongoose version
    var createTasker = function(config) {
        console.log("test");
        return Tasker.create(config);
    };

    var updateUserRef = function(data) {

        return User.findOneAndUpdate({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }, {
            _tasker: data._id
        }).exec();
    };

    _saveOrUpdateTasker(req.body)
        .then(createTasker)
        .then(updateUserRef)
        .then(promiseCallbackHandler.mongooseSuccess(req, next))
        .end(promiseCallbackHandler.mongooseFail(next));
};


exports.updateTasker = function(req, res, next) {


    var getUser = User.findOne({
        _id: new ObjectId(req.user._id),
        status: constants.USER_STATUS.ACTIVE
    }).exec();

    var updateTasker = function(data) {
        var config = data[0];
        var user = data[1];
        if (!!req.body.capableTask) {
            config.capableTask = req.body.capableTask;
        }
        if (!!req.body.availability) {
            config.availability = req.body.availability;
        }

        if (!user._tasker) {
            var err = new Error("Not a tasker");
            err.status = constants.FAIL_STATUS_CODE;
            throw err;
        }
        return Tasker.findOneAndUpdate({
            _id: new ObjectId(user._tasker)
        }, config).exec();
    };

    when.all([_saveOrUpdateTasker(req.body), getUser])
        .then(updateTasker)
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
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
        if (!user) {
            var err = new Error('Unable to find user');
            err.status = constants.FAIL_STATUS_CODE;
            throw err;
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
        if (!!originUserType) {
            User.findOneAndUpdate({
                _id: new ObjectId(req.user._id)
            }, {
                userType: originUserType
            }).exec();
        }
        promiseCallbackHandler.mongooseFail(next)(err);
    };

    updateUser
        .then(deleteTasker)
        .then(promiseCallbackHandler.mongooseSuccess(req, next))
        .end(revertChangeToUser);

};

exports.getTasker = function(req, res, next) {
    var id = req.params.id;


    var userPromise = User.find({
            _id: new ObjectId(id)
        })
        .lean()
        .populate('_tasker')
        .select('_tasker nickName, email')
        .populate({
            path: '_tasker',
            match: {
                status: {
                    $nin: [constants.USER_STATUS.SUSPENDED, constants.USER_STATUS.DELETED]
                }
            }
        })
        .exec();

    var categoryPromise = Category.find({}).exec();

    var populateUser = function(data) {
        var promise = new mongoose.Promise;
        var user = data[0][0];
        var categories = data[1];

        _.each(user._tasker.capableTask, function(value, key) {
            var id = value._categoryId;
            //loop through categories
            _.each(categories, function(category, index) {
                _.each(category.subCategories, function(subCategory, sub_index) {
                    if (subCategory._id.toString() === id.toString()) {
                        user._tasker.capableTask[key].name = subCategory.name;

                    }
                });
            });

            if (key === (user._tasker.capableTask.length - 1)) {
                promise.resolve.bind(promise)(null, user);
            }
        });

        return promise;

    };


    when.all([userPromise, categoryPromise])
        .then(populateUser, promiseCallbackHandler.mongooseFail(next))
        .then(
            promiseCallbackHandler.mongooseSuccess(req, next),
            promiseCallbackHandler.mongooseFail(next)
    )
};


exports.getTaskers = function(req, res, next) {

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