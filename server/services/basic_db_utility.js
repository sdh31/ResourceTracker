var db_sql = require('./db_wrapper');

module.exports.performSingleRowDBOperation = function(query, callback) {
    console.log(query);
    var results = {};
    var error = false;
    var err = '';
	db_sql.connection.query(query)
		.on('result', function (row) {
	        results = row;
	    })
	    .on('error', function (err) {
	        error = true;
            err = err;
	    })
	    .on('end', function () {
	        callback({error: error, results: results, err: err});
	    });
}

module.exports.performMultipleRowDBOperation = function(query, callback) {
    console.log(query);
    var results = [];
    var error = false;
    var err = '';
	db_sql.connection.query(query)
		.on('result', function (row) {
	        results.push(row);
	    })
	    .on('error', function (err) {
	        error = true;
            err = err;
	    })
	    .on('end', function () {
	        callback({error: error, results: results, err: err});
	    });
}
