var express = require('express');
var app = express();
var perm_service = require('../services/permissions');

module.exports.api_auth = function(req, res, next){

    var verify_token_callback = function(results){
        console.log(results)
        if(results.error == false){
            req.signed_in = true
        }
        else{
            if("user" in req.session){
                req.signed_in = true
            }
            req.signed_in = false
        }
        return next();
    }

    if(req.header("Auth-Token") != undefined){
        var token = req.header("Auth-Token");
        perm_service.verify_api_auth_token(token, verify_token_callback);
    }   
    else{
        req.signed_in = false
        return next();
    }
}