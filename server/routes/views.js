var express = require('express');
var router = express.Router();
var app = express();
var ConnectRoles = require('connect-roles');

// Role based authentication
var user_auth = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when 
    // user fails authorisation 
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render('access-denied', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});


user_auth.use('can access resource page', function (req) {
	return req.session && req.session.user && req.session.user.permission_level == 'admin';
});


var basePath =  '/home/bitnami/ResourceTracker/client';

router.get('/', function(req, res, next){
	res.render(basePath + '/views/index.html');
});

router.get('/views/resource.html', user_auth.can('can access resource page'), function (req, res) {
  res.render(basePath + '/views/resource.html');
});

router.get('/views/*.html', function(req, res, next){
	res.render(basePath + req.path);
});

module.exports = router;
