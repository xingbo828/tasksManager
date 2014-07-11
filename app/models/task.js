var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
	constants = require('../../config/constants');
var Schema = mongoose.Schema;


var TaskSchema = new Schema({
    summary: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    taskDoneDate: {
        type: Date,
        required: true
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }
}, {collection: 'tasks', discriminatorKey : '_type'}); 





var InPersonTaskSchema = TaskSchema.extend({
    location : {
        type: String,
        required: true,
        index: true
    } 
});

var DeliveryTaskSchema = TaskSchema.extend({
    locationFrom : {
        type: String,
        required: true,
        index: true
    },
    locationTo : {
        type: String,
        required: true,
        index: true
    }
});

var DeliveryTask = mongoose.model(constants.TASK_TYPES.DELIVERY, DeliveryTaskSchema);
var InPersonTask = mongoose.model(constants.TASK_TYPES.IN_PERSON, InPersonTaskSchema);
var Task = mongoose.model(constants.TASK_TYPES.BASE, TaskSchema);
exports.InPersonTask = InPersonTask;
exports.DeliveryTask = DeliveryTask;
exports.Task = Task;