var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.render('default.html');
});

router.get('/login', function(req, res, next){
	res.render('login.html');
});
module.exports = router;
