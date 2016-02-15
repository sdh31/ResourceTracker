var express = require('express');
var router = express.Router();
var user_service = require('../services/users');
var auth = require('../services/authorization');

router.get('/', auth.is('user'), function(req, res, next){
    //read user
    var getUserCallback = function(result){
        if (result.error) {
            res.send(403);
        } else if (result.empty) {
            console.log("NO USER WITH THAT USERNAME");
            res.send(JSON.stringify(result));
        } else {
            result.password = "";
            res.send(JSON.stringify(result));
        }
    }

    var username = req.session.user.username;
    var is_shibboleth = req.session.user.is_shibboleth;
    user_service.get_user_permissions({username: username, is_shibboleth: is_shibboleth}, getUserCallback);
});

router.put('/', auth.is('admin'), function(req, res, next){
    //create user
    var createUserCallback = function(result){
        if (result.error == true) {
            res.sendStatus(401);
        } else {
            res.sendStatus(200);
        }
    }

    // TODO: need to add permissions here
    if(!('username' in req.body) || !('password' in req.body)){
        res.sendStatus(401);
    } else {
        user_service.create_user(req.body, createUserCallback);
    }
});

router.post('/', auth.is('user'), function(req, res, next){
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

router.delete('/', auth.is('user'), function(req, res, next){
    var deleteUserCallback = function(result) {
        if (result.error) {
            res.sendStatus(403);
        } else {
            res.sendStatus(200);
        }
    }

    var username = req.query["username"];
    user_service.delete_user(username, deleteUserCallback);
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
            req.session.user.is_shibboleth = 0;
            var signInResponse = {};
            //signInResponse.permission_level = user.permission_level;
            res.send(signInResponse);

        } else {
            res.sendStatus(403);
        }
    }

    var getUserCallback = function(result){
        if (result.error == true) {
            res.sendStatus(403);
        } else {
            user_service.compare_passwords(password, result.userInfo, comparePasswordsCallback);
        }
    }

    user_service.get_user_permissions({username: username, is_shibboleth: 0}, getUserCallback);
});

router.post('/signout', auth.is('user'), function(req, res, next){

    req.session.destroy(function() {
        res.type('text/plain');
        res.send('YOU ARE LOGGED OUT');
    });
});

module.exports = router;
