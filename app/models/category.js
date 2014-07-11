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
        }
	}]
    
}); 

var Category = mongoose.model('Category', CategorySchema);

exports.Tag = Category;