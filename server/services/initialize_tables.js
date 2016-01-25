var db = require('./db_wrapper');
var fs = require('fs');
var readline = require('readline');

exports.initializeDB = function(callback) {
  db.pool.getConnection(function(err, connection) {
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
          if(err) {
            console.log(err);
          }
        });
    });

    rl.on('close', function(){
      connection.release();
    });
  });
};
