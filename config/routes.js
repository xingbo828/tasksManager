var config = require('./config'),
    middleWares = require(config.root + '/app/utils/middlewares'),
    constants = require('./constants');
module.exports = function (app) {
    var user = require('../app/controllers/user');
    app.post('/user', user.add, middleWares.sendJson);
    app.post('/session', user.login, middleWares.sendJson);
    app.get('/session', middleWares.ensureAuthenticated(), user.getInfo, middleWares.sendJson);
    app.delete('/session', middleWares.ensureAuthenticated(), user.logout, middleWares.sendJson);
    app.delete('/user', middleWares.ensureAuthenticated(), user.cancel, middleWares.sendJson);
    app.put('/user', middleWares.ensureAuthenticated(), user.update, middleWares.sendJson);
    
    var task = require('../app/controllers/task');

    app.post('/task', middleWares.ensureAuthenticated(), task.addTask, middleWares.sendJson);
    app.put('/task', middleWares.ensureAuthenticated(), task.updateTask, middleWares.sendJson);
	app.delete('/task/:id', middleWares.ensureAuthenticated(), task.deleteTask, middleWares.sendJson);
    app.get('/task', middleWares.ensureAuthenticated(), task.getTasks, middleWares.sendJson);
    app.put('/task/reject/:id', middleWares.ensureAuthenticated(), task.rejectTask, middleWares.sendJson);

    var category = require('../app/controllers/category');
    app.post('/category', category.addCategory, middleWares.sendJson);
    app.get('/category', middleWares.readCache, category.getCategories, middleWares.sendJson);
    app.delete('/category/:id', category.deleteCategory, middleWares.sendJson);
    
    var tasker = require('../app/controllers/tasker');
    app.get('/tasker/filter', tasker.filter, middleWares.sendJson);
    app.post('/tasker', middleWares.ensureAuthenticated(), tasker.addTasker, middleWares.sendJson);
    app.put('/tasker', middleWares.ensureAuthenticated(constants.USER_TYPE.TASKER), tasker.updateTasker, middleWares.sendJson);
    app.get('/tasker/:id', middleWares.ensureAuthenticated(), middleWares.readCache, tasker.getTasker, middleWares.sendJson);
    app.get('/tasker', middleWares.ensureAuthenticated(), middleWares.readCache, tasker.getTaskers, middleWares.sendJson);
    app.delete('/tasker', middleWares.ensureAuthenticated(), tasker.deleteTasker, middleWares.sendJson);
    
};