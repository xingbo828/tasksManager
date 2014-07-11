var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    validators = require('../utils/validators'),
    Schema = mongoose.Schema;


var UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        },
        validate: [{
            validator: validators.notEmpty,
            msg: 'Email is empty'
        }, {
            validator: validators.isEmail,
            msg: 'Invalid email'
        }]
    },
    nickName: {
        type: String,
        required: true,
        validate: [{
            validator: validators.notEmpty,
            msg: 'Nick name is empty'
        }]
    },
    password: {
        type: String,
        required: true,
        validate: [validators.notEmpty, 'Password is empty']
    },
    userType: {
        type: String
    },
    loginHistory: {
        type: Array
    },
    active :{
        type: Boolean
	}
});
UserSchema.pre('save', function (next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if(!user.isModified('password')) return next();
    // generate a salt
 
    bcrypt.genSalt(10, function (err, salt) {
        if(err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if(err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
UserSchema.virtual('date').get(function () {
    return this._id.getTimestamp();
});
UserSchema.methods.validPassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, res) {
        cb(res);
    });
};


var User = mongoose.model('User', UserSchema);


module.exports = User;