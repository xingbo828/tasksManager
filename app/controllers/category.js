var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    errUtil = require('../utils/error'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    Category = mongoose.model('Category'),
    ObjectId = mongoose.Types.ObjectId;
exports.addCategory = function(req, res, next) {
    var name = req.body.name,
        parentId = req.body.parentId;
    var newCategory = new Category({
        name: name,
    });
    if(parentId) {
        newCategory._parent = parentId;
    }
    var addCategory = Category.create(newCategory);
    req.httpCode = 201;
    addCategory.then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};
exports.deleteCategory = function(req, res, next) {
    var id = req.params.id;
    Category.update({
        '_id': new ObjectId(id)
    }, {
        active: false
    }).exec().then(function(num) {
        promiseCallbackHandler.mongooseSuccess(req, next)({
            msg: 'subCategory deleted'
        });
    }, promiseCallbackHandler.mongooseFail(next));
};
exports.getCategories = function(req, res, next) {
    Category.find().exec().then(promiseCallbackHandler.mongooseSuccess(req, next), promiseCallbackHandler.mongooseFail(next));
};