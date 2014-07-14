/**
* Created with appoint.me.
* User: xingbo828
* Date: 2014-07-12
* Time: 06:56 AM
* To change this template use Tools | Templates.
*/
var constants = require('../../config/constants'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    promiseCallbackHandler = require('../utils/promiseCallbackHandler'),
    Tasker = mongoose.model('Tasker'),
    ObjectId = mongoose.Types.ObjectId;

exports.