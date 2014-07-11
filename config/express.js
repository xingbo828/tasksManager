var express = require('express'),
    RedisStore = require("connect-redis")(express.session),
    redis = require("redis").createClient(),
    constants = require('./constants');

module.exports = function (app, passport, config) {  
    app.configure(function () {
        app.use(express.compress());
        app.set('port', config.port);
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser());
        app.use(express.session({
            secret: constants.SECRET,
            store: new RedisStore({
                host: config.redis,
                port: config.redisPort,
                ttl: config.sessionExpiry,
                client: redis
            }),
            cookie: { maxAge: config.sessionExpiry * 1000}
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(app.router);
    });
};