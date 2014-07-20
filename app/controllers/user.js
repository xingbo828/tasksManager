var passport = require('passport'),
    bcrypt = require('bcrypt'),
    constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    errUtil = require('../utils/error'),
    User = mongoose.model('User');
exports.add = function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var nickName = req.body.nickName;
    var confirmPassword = req.body.confirmPassword;
    if( !! confirmPassword) {
        if(confirmPassword !== password) {
            return next(errUtil.newFailedError('password does not match'));
        }
    } else {        
        return next(errUtil.newFailedError('missing confirm password'));
    }
    var newUser = new User({
        email: email,
        password: password,
        nickName: nickName
    });
    newUser.save(function(err) {
        if(err) {
            err.status = constants.FAIL_STATUS_CODE;
            err.name = constants.ERROR_TYPE_MONGOOSE;
            return next(err);
        } else {
            return next();
        }
    });
};
exports.login = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if(err) {
            return next(err);
        }
        if(!user) {
            return res.json({
                validUser: false,
                msg: info.message
            });
        }
        req.logIn(user, function(err) {
            if(err) {
                return next(err);
            }
            return next();
        });
    })(req, res, next);
};
exports.getInfo = function(req, res, next) {
    //     res.json(req.user);
    req.data = req.user;
    return next();
};
exports.logout = function(req, res, next) {
    console.log("LOGOUT");
    req.logout();
    return next();
};
exports.update = function(req, res, next) {
    // TODO: Add update user stuffs
    return next();
}
/////TODO////////
exports.cancel = function(req, res, next) {
    User.update({
        _id: req.user._id
    }, {
        'status': constants.USER_STATUS.DELETED
    }, function(err) {
        if(err) {
            err.status = constants.FAIL_STATUS_CODE;
            err.name = constants.ERROR_TYPE_MONGOOSE;
            return next(err);
        } else {
            return next();
        }
    });
};