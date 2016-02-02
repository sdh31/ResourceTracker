var express = require('express');
var router = express.Router();
var app = express();

var auth = require('../services/authorization');

var basePath =  '/home/bitnami/ResourceTracker/client';

router.get('/', function(req, res, next){
	res.render(basePath + '/views/index.html');
});


// ADMIN PERMISSION LEVEL
var adminViews = ['resource.html', 'register.html'];

adminViews.forEach(function(adminView) {
    router.get('/views/' + adminView, auth.is('admin'), function (req, res) {
        res.render(basePath + '/views/' + adminView);
    });
});

// NO PERMISSION REQUIRED
var permissionlessViews = ['index.html', 'login.html', 'contact.html'];

permissionlessViews.forEach(function(view) {
    router.get('/views/' + view, function (req, res) {
        res.render(basePath + '/views/' + view);
    });
});

// DEFAULT TO USER PERMISSION LEVEL
router.get('/views/*.html', auth.is('user'), function(req, res, next){
	res.render(basePath + req.path);
});

module.exports = router;
