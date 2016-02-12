var express = require('express');
var router = express.Router();
var group_service = require('../services/groups');

router.get('/', function(req,res,next){
    var get_group_callback = function(result){
        if(result.error == true){
            res.status(400).json(result.err);
        }
        else{
            res.status(200).json(result.results);
        }
    }

    group_service.get_groups_by_id(req.query, get_group_callback)


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
    var update_group_callback = function(result){
        if(result.error == true){
            res.status(400).json(result.err);
        }
        else{
            res.status(200).json(result.results);
        }
    }
    group_service.update_group_by_id(req.body, update_group_callback);
});

router.delete('/', function(req,res,next){
    var delete_group_callback = function(result){
        if(result.error == true){
            res.status(400).json(result.err);
        }
        else{
            res.status(200).json(result.results);
        }
    }

    group_service.delete_group_by_id(req.query, delete_group_callback);

});


router.put('/user', function(req,res,next){
    var delete_group_callback = function(result){
        if(result.error == true){
            res.status(400).json(result.err);
        }
        else{
            res.status(200).json(result.results);
        }

    }


});

router.delete('/user', function(req,res,next){

});

module.exports = router;