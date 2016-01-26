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

	if(req.body.username == null || req.body.password == null || req.body.permission_level == null){
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

router.get('/signin', function(req, res, next){
	//login user

	var username = req.body.username;
	var password = req.body.password;

	var comparePasswordsCallback = function(result) {
		if (result == true) {
			// might needa change this for redirects?
			res.sendStatus(200);

			if (req.session.isValid) {
			    console.log("There is an existing session.");
			}
		  	else {
				req.session.isValid = true;
				console.log("New session.");
				console.log('Old session ID: ' + req.header('Cookie'));
				console.log('New session ID: ' + req.session.id);
		  	}

		} else {
			res.sendStatus(403);
		}
	}

	var getUserCallback = function(result){
		if (result.error == true) {
			res.sendStatus(403);
		} else {
			user_service.compare_passwords(password, result.password, comparePasswordsCallback);
		}
	}

	user_service.get_user(username, getUserCallback);
});

router.get('/signout', function(req, res, next){
	res.type('text/plain');
	res.send('YOU ARE LOGGED OUT');
})

module.exports = router;
