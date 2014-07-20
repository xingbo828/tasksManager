var mongoose = require('mongoose'),
    constants = require('../../config/constants');
var Schema = mongoose.Schema;
var CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    _parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});
var Category = mongoose.model('Category', CategorySchema);
exports.Tag = Category;