var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'myapp'
    },
    port: 3000,
    db: 'mongodb://localhost/myapp-development',
    redis:'localhost',
    redisPort:6379,
    queryCacheExpire:  5, //cache query get result for 5 seconds
    sessionExpiry: 60 * 5 * 10, //5 mins expire
    allowOriginUrl: "http://medley-skeipp.codio.io:3000"
  },
    
  developmentAlt: {
    root: rootPath,
    app: {
      name: 'myapp'
    },
    port: 3001,
    db: 'mongodb://localhost/myapp-development',
    redis:'localhost',
    redisPort:6379,
    queryCacheExpire:  5, //cache query get result for 5 seconds
    sessionExpiry: 60 * 5 //5 mins expire
      
  },

  production: {
    root: rootPath,
    app: {
      name: 'myapp'
    },
    port: 3000,
    db: 'mongodb://localhost/myapp-production',
    redis:'localhost',
    redisPort:6379,
    queryCacheExpire: 30, //cache query get result for 1 min
    sessionExpiry: 60 * 60 * 24 //1 day expire
  }
};

module.exports = config[env];
