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
        if (result.error) {
            res.sendStatus(401);
        } else {
            res.status(200).json(result);
        }
    }

    var checkUserManagementPermissionCallback = function(results){
        if (results.error){
            res.status(400).json(result.err)
        } else if (!results.auth){
            res.sendStatus(403);
        } else {
            if(!('username' in req.body) || !('password' in req.body)){
                res.sendStatus(401);
            } else {
                user_service.create_user(req.body, createUserCallback);
            }
        }
    }

    perm_service.check_user_management_permission(1, req.session.user, checkUserManagementPermissionCallback);
});

router.post('/', auth.is('user'), function(req, res, next){
    //update user

    var updateUserCallback = function(result) {
        if (result.error) {
            res.sendStatus(401);
        } else {
            res.sendStatus(200);
        }
    }

    var checkUserManagementPermissionCallback = function(results){
        if (results.error){
            res.status(400).json(result.err)
        } else if (!results.auth){
            // if user does not have user management permission, check if they are trying to update themselves
            if (req.body.username == req.session.user.username) {
                user_service.update_user(req.body, updateUserCallback);
            } else {
                res.sendStatus(403);
            }
        } else {
            // if they do have user management permission, just let them do what they gotta do
            user_service.update_user(req.body, updateUserCallback);
        }
    }

    /// first check if user has user management permission
    perm_service.check_user_management_permission(1, req.session.user, checkUserManagementPermissionCallback);
});

router.delete('/', auth.is('user'), function(req, res, next){
    var username = req.query["username"];

    var deletePrivateGroupCallback = function(result) {
        if (result.error) {
            res.sendStatus(403);
        } else {
            res.sendStatus(200);
        }
    };

    var deleteUserCallback = function(result) {
        if (result.error) {
            res.sendStatus(403);
        } else {
            user_service.delete_private_group(username, deletePrivateGroupCallback);
        }
    };

    var checkUserManagementPermissionCallback = function(results){
        if (results.error){
            res.status(400).json(result.err)
        } else if (!results.auth){
            res.sendStatus(403);
        } else {
            user_service.delete_user(username, deleteUserCallback);
        }
    }

    perm_service.check_user_management_permission(1, req.session.user, checkUserManagementPermissionCallback);
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
        res.status(200).json({results: 'YOU ARE LOGGED OUT'});
    });
});

router.post('/token', function(req, res, next){
    var get_token_callback = function(result){
        res.status(200).json(result)
    }
    perm_service.generate_api_auth_token(req.session.user, get_token_callback)
});



module.exports = router;
