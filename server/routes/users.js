var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
  //read user
  res.type('text/plain');
  res.send('HELLO');
});

router.put('/', function(req, res, next){
  //create user
});

router.post('/', function(req, res, next){
  //update user
});

router.delete('/', function(req, res, next){
  //delete user
});

router.get('/signin', function(req, res, next){
  //login user
  res.type('text/plain');
  res.send('YOU ARE LOGGED IN');
});

router.get('/signout', function(req, res, next){
  res.type('text/plain');
  res.send('YOU ARE LOGGED OUT');
})

module.exports = router;
