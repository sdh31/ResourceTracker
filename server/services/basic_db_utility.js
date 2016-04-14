var db_sql = require('./db_wrapper');

module.exports.performSingleRowDBOperation = function(query, callback) {
    console.log(query);
    var results = {};
    var error = false;
    var err_message = '';
	db_sql.connection.query(query)
		.on('result', function (row) {
	        results = row;
	    })
	    .on('error', function (err) {
            console.log(err)
	        error = true;
            err_message = err;
	    })
	    .on('end', function () {
	        callback({error: error, results: results, err: err_message});
	    });
};

module.exports.performMultipleRowDBOperation = function(query, callback) {
    console.log(query);
    var results = [];
    var error = false;
    var err_message = '';
    db_sql.connection.query(query)
	    .on('result', function (row) {
            results.push(row);
        })
        .on('error', function (err) {
            console.log(err)
            error = true;
            err_message = err;
        })
        .on('end', function () {
            callback({error: error, results: results, err: err_message});
        });
};

module.exports.performMultipleRowDBOperationOnlyUniqueValues = function(query, fieldToIgnoreBy, callback) {
    console.log(query);
    var results = [];
    var error = false;
    var err_message = '';
    var alreadySeen = [];
    db_sql.connection.query(query)
	    .on('result', function (row) {
            if (alreadySeen.indexOf(row[fieldToIgnoreBy]) == -1) {
                alreadySeen.push(row[fieldToIgnoreBy]);
                results.push(row);
            }
        })
        .on('error', function (err) {
            console.log(err);
            error = true;
            err_message = err;
        })
        .on('end', function () {
            callback({error: error, results: results, err: err_message});
        });
};

module.exports.performMultipleRowDBOperationIgnoreDuplicates = function(query, callback) {
    console.log(query);
    var results = [];
    var error = false;
    var err = '';
    db_sql.connection.query(query)
	    .on('result', function (row) {
            results.push(row);
        })
        .on('error', function (err) {
            if (err.code != "ER_DUP_ENTRY"){
                error = true;
                err = err;
            }
        })
        .on('end', function () {
            callback({error: error, results: results, err: err});
        });
};
