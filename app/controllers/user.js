var passport = require('passport'),
    bcrypt = require('bcrypt'),
    constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    errUtil = require('../utils/error'),
    User = mongoose.model('User'),
    Category = mongoose.model('Category'),
    ObjectId = mongoose.Types.ObjectId;
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
            console.log(err.name);
            err.status = constants.FAIL_STATUS_CODE;
            err.type = constants.ERROR_TYPE_MONGOOSE;
            return next(err);
        } else {
            req.httpCode = 201;
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
            req.data = req.user;
            return next();
        });
    })(req, res, next);
};
exports.getInfo = function(req, res, next) {
    //     res.json(req.user);
    req.data = req.user;
    return next();
};
exports._getUser = function(id, sucessFn, FailureFn) {
    var userPromise = User.findOne({
        _id: new ObjectId(id)
    }).lean().select('_id _tasker nickName email userType').populate({
        path: '_tasker',
        match: {
            status: {
                $nin: [constants.USER_STATUS.SUSPENDED, constants.USER_STATUS.DELETED]
            }
        }
    }).exec();
    var populateCategory = function(user) {
        if(!user) {
            throw errUtil.newFailedError('No such tasker');
        }
        return Category.populate(user, {
            path: '_tasker.capableTask._categoryId'
        });
    };
    userPromise.then(populateCategory).then(sucessFn, FailureFn);
}
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
            err.type = constants.ERROR_TYPE_MONGOOSE;
            return next(err);
        } else {
            return next();
        }
    });
};