var express = require('express');
var app = express();
var perm_service = require('../services/permissions');
var route_whitelists = require('../constants/route_whitelists/route_permissions')

module.exports.api_auth = function(req, res, next){

    var verify_token_callback = function(results){
        if(!results.error){
            req.session.isValid = true
            req['session']['user'] = results.user
        }
        else{
            console.log(results)
        }
        return next();
    }
    
    if(req.header("Auth-Token") != undefined){
        var token = req.header("Auth-Token");
        perm_service.verify_api_auth_token(token, verify_token_callback);
    }   
    else{
       return next();
    }
}

module.exports.populate_permissions = function(req, res, next){
    var get_permission_callback = function(result){
        if (result.error){
            set_permission_defaults();
            console.log(result.err);
            next();
        }
        else{
            req.session.user.user_management_permission = result.results.user_management_permission;
            req.session.user.resource_management_permission = result.results.resource_management_permission;
            req.session.user.reservation_management_permission = result.results.reservation_management_permission;
            next();
        }
    }
    if(!req.session.isValid){
            req.session.auth = false
            next();
    }
    else if("user" in req.session){
        req.session.auth = true
        perm_service.get_all_system_permissions(req.session.user, get_permission_callback);
    }
}

function set_permission_defaults(user){
    user.user_management_permission = 0;
    user.resource_management_permission = 0;
    user.reservation_management_permission = 0;
}