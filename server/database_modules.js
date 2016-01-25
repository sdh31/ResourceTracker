var mysql = require('mysql');
var fs = require('fs');
var readline = require('readline');

var pool  = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'db',
  database: 'test_db'
});

exports.initializeDB = function(callback) {
  pool.getConnection(function(err, connection) {
    if(err) { 
	console.log(err); 
	callback(true); 
	return; 
    }

var rl = readline.createInterface({
  input: fs.createReadStream('./create_tables.sql'),
  terminal: false
 });

rl.on('line', function(chunk){
    connection.query(chunk.toString('ascii'), [], function(err, results){
     
     if(err) console.log(err);
    });
});

rl.on('close', function(){
  connection.release();
});

  });
};

exports.pool = pool;
