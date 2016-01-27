var db_sql = require('./db_wrapper');
var squel = require('squel');

function create_resource_tag_link(res_id, tag_id, callback){
        var query = squel.insert()
                    .into('resource_tag')
                    .set('tag_id', tag_id)
                    .set('resource_id', res_id)
                    .toString()
            db_sql.connection.query(query)
                .on('error', function (err) {
                    callback({error: true, err: err});
                })
                .on('end', function () {
                    callback({error: false});
                });
}

function create_tag (res_id, tag, response_callback, tag_callback){
    var insert_query = squel.insert()
        .into('tag')
        .set('tag_name', tag)
        .toString()
        console.log(insert_query);
        db_sql.connection.query(insert_query)
        .on('error', function (err) {
            response_callback({error: true, err: err});
         })
        .on('end', function () {
            select_tag_id(res_id, tag, response_callback, tag_callback);
        });
}

function select_tag_id(res_id, tag, response_callback, tag_callback){
    var select_query = squel.select()
                .from('tag') 
                .field("tag_id")
                .where("tag_name = '" + tag + "'")
                .toString()
            db_sql.connection.query(select_query)
                .on('result', function (row) {
                    console.log(row);
                    tag_callback(res_id, row.tag_id, response_callback);
                })
                .on('error', function (err) {
                    response_callback({error: true, err: err});
                })
                .on('end', function () {
                });
}

module.exports = {
    create_tag:create_tag,
    create_resource_tag:create_resource_tag
}