var express = require('express');
var router = express.Router();
var app = express();

app.set('/views', '../../client/app/views/');
var basePath = app.settings['/views'];

router.get('/', function(req, res, next){
	res.render(basePath + 'index.html');
});

router.get('/login.html', function(req, res, next){
	res.render(basePath + 'login.html');
});

router.get('/register.html', function(req, res, next){
	res.render(basePath + 'register.html');
});

router.get('/contact.html', function(req, res, next){
	res.render(basePath + 'contact.html');
});

module.exports = router;
