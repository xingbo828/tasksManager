var mongoose = require('mongoose'),
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
    location : {
        type: String,
        required: true,
        index: true
    },
    taskDoneDate: {
        type: Date,
        required: true
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _tasker: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    status:{
        type: Number,
        default: constants.TASK_STATUS.ASSIGNED
    }
}); 



var Task = mongoose.model('Task', TaskSchema);
exports.Task = Task;