/**
 * Created with appoint.me.
 * User: xingbo828
 * Date: 2014-07-12
 * Time: 05:50 AM
 * To change this template use Tools | Templates.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    constants = require('../../config/constants');
var TaskerSchema = new Schema({
    city: {
        type: String,
        required: true,
        index: true
    },
    bio: {
        type: String,
        required: true
    },
    hasVehicle: {
        type: Boolean,
        required: true,
        default: false
    }
    ,
    capableTask: [{
        _categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category'
        },
        description: {
            type: String
        },
        rate: {
            type: Number
        }
    }],
    status: {
        type: Number
    },
    availability: [{
        day: {
            type: Number
        },
        timeSlot: [Boolean]
    }]
});


exports.Tasker = mongoose.model('Tasker', TaskerSchema);