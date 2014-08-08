var config = require('./config');

var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", config.allowOriginUrl);
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Authorization");
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
};
module.exports = function (app){
    app.use(allowCrossDomain);
}