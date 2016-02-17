var db_sql = require('./db_wrapper');

module.exports.performSingleRowDBOperation = function(query, callback) {
    var results = {};
    var error = false;
	db_sql.connection.query(query)
		.on('result', function (row) {
	        results = row;
	    })
	    .on('error', function (err) {
	        error = true;
	    })
	    .on('end', function () {
	        callback({error: error, results: results});
	    });
}
