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

exports.updateTasker = function (req, res, next) {
    
    _saveOrUpdateTasker(req, res, next, function (config) {
        if(!!req.body.capableTask){
            config.capableTask = req.body.capableTask;
        }
        if(!!req.body.availability){
            config.availability = req.body.availability;
        }
        

        // Promise does propagate error and rejected to the last onRejected handler
        // It didn't work when I tested before because I didn't put throw error in promise
        // If find user query does have an error, it would happen in promise
        // So it should be propagated to the last onRejected handler
        // Uncomment the next line to test - Alan
        //.then(function(){throw Error("Uncaught promise error?");})
        //
        var updateTasker = function (user) {
            if(!user) {
                var err = {
                    status: constants.FAIL_STATUS_CODE,
                    errors: new Error('Unable to find user')
                };
                throw new Error('Unable to find user');
            }
            return Tasker.findOneAndUpdate({
                _id: new ObjectId(user._tasker)
            }, config).exec();
        };
        
        
        User.findOne({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }).exec()
        .then(updateTasker, promiseCallbackHandler.mongooseFail(next))
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next))
        .end();
    });
};

exports.deleteTasker = function (req, res, next) {
    _saveOrUpdateTasker(function (config) {
        var originUserType = '';
        var updateTasker = function (user) {
            if(!user) {
                var err = {
                    status: constants.FAIL_STATUS_CODE,
                    errors: new Error('Unable to find user')
                };
                throw new Error('Unable to find user');
            }
            originUserType = user.userType;
            return Tasker.findOneAndUpdate({
                _id: new ObjectId(user._tasker)
            }, {
                status: constants.USER_STATUS.DELETED
            }).exec();
        };
        
        var revertChangeToUser = function (err) {
            User.findOneAndUpdate({
                _id: new ObjectId(req.user._id)
            }, {
                userType: originUserType
            }).exec();
            promiseCallbackHandler.mongooseFail(next)(err);
        };
        
        User.findOneAndUpdate({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }, {
            userType: constants.USER_TYPE.STANDARD
        }).exec()
        .then(updateTasker, promiseCallbackHandler.mongooseFail(next))
        .then(promiseCallbackHandler.mongooseSuccess(req, next), revertChangeToUser)
        .end();
    });
};

exports.addTasker = function(req, res, next) {
    // create supports promise while save only support promise on the latest version
    var createTasker = function(config) {
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
        .then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};


exports.updateTasker = function(req, res, next) {

    var getUser = function() {
        return User.findOne({
            _id: new ObjectId(req.user._id),
            status: constants.USER_STATUS.ACTIVE
        }).exec();
    };

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
  
    
    var userPromise = User.find({
        _id: new ObjectId(id)
    })
    .lean()
    .populate('_tasker')
    .select('_tasker nickName, email')
    .populate({
        path: '_tasker',
        match: {status: {$nin:[constants.USER_STATUS.SUSPENDED, constants.USER_STATUS.DELETED]}}
    })
    .exec();
    
    var categoryPromise = Category.find({}).exec();
    
    var populateUser = function(data){
      var promise = new mongoose.Promise;
      var user = data[0][0];
      var categories = data[1];

        _.each(user._tasker.capableTask, function(value, key){
           var id = value._categoryId;
            //loop through categories
            _.each(categories, function(category, index){
                _.each(category.subCategories, function(subCategory, sub_index){
                    if(subCategory._id.toString() === id.toString()){
                        user._tasker.capableTask[key].name = subCategory.name;
                        
                    }
                });
            });
            
            if(key === (user._tasker.capableTask.length - 1)){
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
   .end();    
};


exports.getTaskers = function (req, res, next) {

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