var express = require('express');
var router = express.Router();
var app = express();

var basePath =  '/home/bitnami/ResourceTracker/client';

router.get('/', function(req, res, next){
	res.render(basePath + '/views/index.html');
});

router.get('/views/*.html', function(req, res, next){
	res.render(basePath + req.path);
});

module.exports = router;
