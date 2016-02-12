var express = require('express');
var router = express.Router();
var group_service = require('../services/permissions');

router.get('/', function(req,res,next){


});

router.put('/', function(req,res,next){
    var create_group_callback = function(result){
        if(result.error == true){
            res.status(400).json(result.err);
        }
        else{
            res.status(200).json(result.results);
        }
    }
    if(!('name' in req.body) ){
        res.status(400).json({err: 'no group name specified'});
    }
    group_service.toggle_group_privacy(req.body, true);

    group_service.create_group(req.body, create_group_callback);

});

router.post('/', function(req,res,next){

});

router.delete('/', function(req,res,next){

});

router.put('/user', function(req,res,next){

});

router.delete('/user', function(req,res,next){

});
