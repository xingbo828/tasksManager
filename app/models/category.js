var mongoose = require('mongoose'),
    constants = require('../../config/constants');
var Schema = mongoose.Schema;
var CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    subCategories: [{
        name: {
            type: String,
            required: true,
            index: true
        },
        active: {
            type: Boolean,
            required: true,
            default: true
        }
    }],
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});
var Category = mongoose.model('Category', CategorySchema);
exports.Tag = Category;