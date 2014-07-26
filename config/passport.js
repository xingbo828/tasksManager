var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    constants = require("./constants"),
    UserController = require('../app/controllers/user');
passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(userId, done) {
    UserController._getUser(userId, function(user){
        done(null, user);
    }, function(err){
        done(err, null);
    });
});
User = mongoose.model('User');
passport.use(new LocalStrategy({
    usernameField: 'email'
}, function(email, password, done) {
    User.findOne({
        email: email,
        status: constants.USER_STATUS.ACTIVE
    }, function(err, user) {
        if(err) {
            return done(err);
        }
        if(!user) {
            var err = {
                status: constants.UNAUTHORIZED_STATUS_CODE,
                errors: new Error('User not found')
            };
            return done(err);
        }
        user.validPassword(password, function(valid) {
            if(!valid) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            User.update({
                _id: user._id
            }, {
                $push: {
                    'loginHistory': Date.now()
                }
            }, function(err) {
                if(err) {
                    return done(err);
                }
                return done(null, user);
            });
        });
    });
}));
module.exports = passport;