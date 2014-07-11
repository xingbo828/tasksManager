var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    middleWares = require('../utils/middlewares'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    Category = mongoose.model('Category'),
    ObjectId = mongoose.Types.ObjectId;


exports.addCategory = function (req, res, next) {
    var name = req.body.name,
        parentId = req.body.parentId;
    var newCategory = new Category({
        name: name
    });
    //Parent category
    if(!parentId) {
        newCategory.save(function (err, data) {
            if(err) {
                promiseCallbackHandler.mongooseFail(next)(err);
            } else {
                promiseCallbackHandler.mongooseSuccess(req, next)(data);
            }
        });
    }
    //Child category
    else {
        Category.update({
            _id: new ObjectId(parentId)
        }, {
            $push: {
                subCategories: newCategory
            }
        }).exec().then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
    }
};



exports.deleteCategory = function (req, res, next) {
    var id = req.params.id;
    Category.update({
        'subCategories._id': new ObjectId(id)
    }, {
        $pull: {
            'subCategories': {
                '_id': new ObjectId(id)
            }
        }
    }).exec().then(function (num) {
        if(num > 0) {
            promiseCallbackHandler.mongooseSuccess(req, next)({
                msg: 'subCategory deleted'
            });
        } else {
            Category.find({
                '_id': new ObjectId(id)
            }).remove().exec().then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
        }
    }, promiseCallbackHandler.mongooseFail(next));
};


exports.getCategories = function (req, res, next) {
    Category.find().exec().then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};