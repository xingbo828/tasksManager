var mongoose = require('mongoose'),
	constants = require('../../config/constants');

var Schema = mongoose.Schema;


var TagSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    _parentTag: {
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    },
    _childTags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }]
    
}); 

var Tag = mongoose.model('Tag', TagSchema);

exports.Tag = Tag;