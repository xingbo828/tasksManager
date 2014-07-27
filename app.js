// var cluster = require('cluster');
// cluster.on('online', function(worker) {
//     console.log('\n worker %d online...',
//     worker.process.pid);
// });

// cluster.on('exit', function(worker, code, signal) {
//   console.log('\n worker %d died (%s). restarting...',
//     worker.process.pid, signal || code);
//   cluster.fork();
// });


// if(cluster.isMaster) {
//     var cpuCount = require('os').cpus().length;
//     for (var i = 0; i < cpuCount; i += 1) {
//         cluster.fork();
//     }
    
// } else {
    var express = require('express'),
        mongoose = require('mongoose'),
        fs = require('fs'),
        config = require('./config/config');
    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', function () {
        throw new Error('unable to connect to database at ' + config.db);
    });
    var modelsPath = __dirname + '/app/models';
    fs.readdirSync(modelsPath).forEach(function (file) {
        if(file.indexOf('.js') >= 0) {
            require(modelsPath + '/' + file);
        }
    });
    var app = express();
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://medley-skeipp.codio.io:3000");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Authorization");
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
};

app.use(allowCrossDomain);

    var passport = require('./config/passport');
    require('./config/express')(app, passport, config);
    require('./config/routes')(app);
    require('./config/errorHandlers')(app);
    app.listen(config.port);
// }

