var express = require('express');
var router = express.Router();
var user_service = require('../services/users');
var auth = require('../services/authorization');
var perm_service = require('../services/permissions');

router.get('/', auth.is('user'), function(req, res, next){
    //read user
    var getUserCallback = function(result){
        if (result.error) {
            res.send(403);
        } else if (result.empty) {
            console.log("NO USER WITH THAT USERNAME");
            res.send(JSON.stringify(result));
        } else {
            result.user.password = "";
            res.send(JSON.stringify(result.user));
        }
    }

    if (!req.session.user || !('username' in req.session.user) || !('is_shibboleth' in req.session.user)) {
        res.send({noSession: true});
    } else {
        var username = req.session.user.username;
        var is_shibboleth = req.session.user.is_shibboleth;
        user_service.get_user_permissions({username: username, is_shibboleth: is_shibboleth}, getUserCallback);
    }
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

router.get('/all', function(req,res,next){
    var getAllUsersCallback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    }

    var user_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result);
        } else if(!results.auth){
            res.sendStatus(403);
        } else {
            user_service.get_all_users(getAllUsersCallback);
        }
    }
    
    perm_service.check_user_management_permission(1, req.session.user, user_permission_callback);

});

router.post('/signin', function(req, res, next){
    //login user
    var username = req.body.username;
    var password = req.body.password;

    var comparePasswordsCallback = function(result, user) {
        if (result == true) {
            // might needa change this for redirects?
            user.password = '';
            req.session.isValid = true;
            req.session.user = user;

            res.send(user);

        } else {
            res.sendStatus(403);
        }
    }

    var getUserCallback = function(result){
        if (result.error == true) {
            res.sendStatus(403);
        } else {
            user_service.compare_passwords(password, result.user, comparePasswordsCallback);
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
