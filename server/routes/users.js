var express = require('express');
var router = express.Router();
var user_service = require('../services/users');

router.get('/', function(req, res, next){
	console.log('get called on back end');
	//read user
	var callback = function(err, result){
  		//console.log(result);
  		res.send(result);
    	//need to add json response
	}
	username=req.query["username"];
	password=req.query["password"];
	permission_level=req.query["permission_level"];
	user_service.validate_user(username, password, callback);
});

router.put('/', function(req, res, next){
	//create user
  	var callback = function(err, result){
  		//if !Object.keys(obj).length{

  		//}
  	}
  	//These might need to be changed to json body fields
  	username = req.query["username"];
  	password = req.query["password"];
	  permission_level = req.query["permission_level"];

  	if(username == null || password == null || permission_level == null){
	  	res.sendStatus(401);
  	}
  	else{
  		user_service.create_user(username, password, permission_level, callback);
  	}
});

router.post('/', function(req, res, next){
	//update user
});

router.delete('/', function(req, res, next){
	//delete user
});

router.get('/signinn', function(req, res, next){
	//login user
	res.type('text/plain');
	res.write('YOU ARE LOGGED IN');
});

router.get('/signout', function(req, res, next){
	res.type('text/plain');
	res.send('YOU ARE LOGGED OUT');
})

module.exports = router;
