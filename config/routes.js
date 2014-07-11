var config = require('./config'),
    middleWares = require(config.root + '/app/utils/middlewares');
module.exports = function (app) {
    var user = require('../app/controllers/user');
    app.post('/user', user.add, middleWares.sendJson);
    app.post('/session', user.login, middleWares.sendJson);
    app.get('/session', middleWares.ensureAuthenticated, user.getInfo, middleWares.sendJson);
    app.delete('/session', middleWares.ensureAuthenticated, user.logout, middleWares.sendJson);
    app.delete('/user', middleWares.ensureAuthenticated, user.cancel, middleWares.sendJson);
    app.put('/user', middleWares.ensureAuthenticated, user.update, middleWares.sendJson);
    var task = require('../app/controllers/task');
    //In Person Tasks
    app.post('/task/inperson', middleWares.ensureAuthenticated, task.addInPersonTask, middleWares.sendJson);
    app.get('/task/inperson', middleWares.readCache, task.getInPersonTasks, middleWares.sendJson);
    app.put('/task/inperson', middleWares.ensureAuthenticated, task.updateInPersonTask, middleWares.sendJson);
    app.delete('/task/inperson', middleWares.ensureAuthenticated, task.deleteInPersonTask, middleWares.sendJson);
    //Delivery Tasks
    app.post('/task/delivery', middleWares.ensureAuthenticated, task.addDeliveryTask, middleWares.sendJson);
    app.get('/task/delivery', middleWares.readCache, task.getDeliveryTasks, middleWares.sendJson);
    app.put('/task/delivery', middleWares.ensureAuthenticated, task.updateDeliveryTask, middleWares.sendJson);
    app.delete('/task/delivery', middleWares.ensureAuthenticated, task.deleteDeliveryTask, middleWares.sendJson);
    app.get('/task/mytasks', middleWares.ensureAuthenticated, task.getMyTasks, middleWares.sendJson);
    var category = require('../app/controllers/category');
    app.post('/category', category.addCategory, middleWares.sendJson);
    app.get('/category', middleWares.readCache, category.getCategories, middleWares.sendJson);
    app.delete('/category/:id', category.deleteCategory, middleWares.sendJson);
};