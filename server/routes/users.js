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
            res.status(400).json(result);
        } else {
            result.results.password = "";
            res.status(200).json(result);
        }
    }

    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {
        var username = req.session.user.username;
        //Allow this call to be made with arbitrary username as well
        if("username" in req.query){
            username = req.query.username
        }
        user_service.get_user_permissions({"username": username}, getUserCallback);
    }
});

router.put('/', auth.is('admin'), function(req, res, next){
    //create user
    if(!perm_service.check_user_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    var createUserCallback = function(result){
        if (result.error) {
            res.sendStatus(401);
        } else {
            res.status(200).json(result);
        }
    }

    if(!('username' in req.body) || !('password' in req.body)){
        res.status(401).json({err: "no username or password provided"});
    } 
    else {
        user_service.create_user(req.body, createUserCallback);
    }
}

);

router.post('/', auth.is('user'), function(req, res, next){
    //update user
    
    var updateUserCallback = function(result) {
        if (result.error) {
            res.sendStatus(401).json(result);
        } else {
            res.sendStatus(200);
        }
    }

    if (!perm_service.check_user_permission(req.session)){
        // if user does not have user management permission, check if they are trying to update themselves
        if(req.session.auth){
            if (req.body.username == req.session.user.username) {
                user_service.update_user(req.body, updateUserCallback);
            }
        }
        else {
            res.status(403).json(perm_service.denied_error)
        }
    } else {
            // if they do have user management permission, just let them do what they gotta do
            user_service.update_user(req.body, updateUserCallback);
        }
    }
);

router.delete('/', auth.is('user'), function(req, res, next){
    
    if(!perm_service.check_user_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

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
    
    user_service.delete_user(username, deleteUserCallback)
});

router.get('/all', function(req,res,next){
    if(!perm_service.check_user_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    var getAllUsersCallback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    }
    user_service.get_all_users(getAllUsersCallback);
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
            user_service.compare_passwords(password, result.results, comparePasswordsCallback);
        }
    }

    user_service.get_user_permissions({username: username}, getUserCallback);
});

router.post('/signout', auth.is('user'), function(req, res, next){
    console.log("signing out")
    if(!req.session.auth){
        res.status(403).json({err: "You are not signed in!"});
        return;
    }

    req.session.destroy(function() {
        res.type('text/plain');
        res.status(200).json({results: 'YOU ARE LOGGED OUT'});
    });
});

router.post('/token', function(req, res, next){
    console.log("creating token")
    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    var get_token_callback = function(result){
        res.status(200).json(result)
    }
    perm_service.generate_api_auth_token(req.session.user, get_token_callback)
});



module.exports = router;
