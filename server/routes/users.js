var express = require('express');
var router = express.Router();
var user_service = require('../services/users');

router.get('/', function(req, res, next){
	//read user
	var getUserCallback = function(result){
		result.password = "";
  		res.send(JSON.stringify(result));
    	//need to add json response
	}
	var username=req.query["username"];
	
	user_service.get_user(username, getUserCallback);
});

router.put('/', function(req, res, next){
	//create user
  	var createUserCallback = function(result){
  		if (result.error == true) {
			res.sendStatus(401);
		} else {
			res.sendStatus(200);
		}
  	}
  	//These might need to be changed to json body fields

	if(!req.session || !req.session.user || !(req.session.user.permission_level == 'admin') || req.body.username == null || req.body.password == null || req.body.permission_level == null){
	  	res.sendStatus(401);
  	} else {
		user_service.create_user(req.body, createUserCallback);
	}
});

router.post('/', function(req, res, next){
	//update user

	var updateUserCallback = function(result) {

		if (result.error == true) {
			res.sendStatus(401);
		} else {
			// send updated user info too?
			res.sendStatus(200);
		}
	}

	user_service.update_user(req.body, updateUserCallback);
});

router.delete('/', function(req, res, next){
	var deleteUserCallback = function(err) {
		if (err.error == false) {
			res.sendStatus(200);
		} else {
			// not sure of correct error code to send in this case
			res.sendStatus(403);
		}
	}

	var username = req.body.username;
	if (username == null || username == "") {
		res.sendStatus(403);
	} else {

		user_service.delete_user(username, deleteUserCallback);
	}
});

router.post('/signin', function(req, res, next){
	//login user
	var username = req.body.username;
	var password = req.body.password;

	var comparePasswordsCallback = function(result, user) {
		if (result == true) {
			// might needa change this for redirects?
			req.session.isValid = true;
			req.session.user = user;
			var signInResponse = {};
			signInResponse.permission_level = user.permission_level;
			res.send(signInResponse);

		} else {
			res.sendStatus(403);
		}
	}

	var getUserCallback = function(result){
		if (result.error == true) {
			res.sendStatus(403);
		} else {
			user_service.compare_passwords(password, result, comparePasswordsCallback);
		}
	}

	user_service.get_user(username, getUserCallback);
});

router.post('/signout', function(req, res, next){

	req.session.destroy(function() {
		res.type('text/plain');
		res.send('YOU ARE LOGGED OUT');
	});
})

module.exports = router;
