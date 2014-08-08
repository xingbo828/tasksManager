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




    if((process.env.NODE_ENV || 'development') === 'development'){
        require('./config/developmentEnv')(app);
    }

    var passport = require('./config/passport');
    require('./config/express')(app, passport, config);
    require('./config/routes')(app);
    require('./config/errorHandlers')(app);
    app.listen(config.port);
// }

