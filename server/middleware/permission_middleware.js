var express = require('express');
var app = express();
var perm_service = require('../services/permissions');

module.exports.api_auth = function(req, res, next){

    var verify_token_callback = function(results){
        if(results.error == false){
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