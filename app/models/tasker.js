/**
 * Created with appoint.me.
 * User: xingbo828
 * Date: 2014-07-12
 * Time: 05:50 AM
 * To change this template use Tools | Templates.
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    UserSchema = require("./user").UserSchema,
    Schema = mongoose.Schema;
var TaskerSchema = UserSchema.extend({
    tasker: {
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
        },
        capableTask: [{
            _categoryId: {
                type: Schema.Types.ObjectId,
                ref: 'Category',
                required: true,
                index: {
                    unique: true
                },
            },
            description: {
                type: String,
                required: true
            },
            rate: {
                type: Number,
                required: true
            }
        }],
        availability: [{
            day: {
                type: Number,
                required: true,
                index: {
                    unique: true
                }
            },
            timeSlot: [Boolean]
        }]
    }
});