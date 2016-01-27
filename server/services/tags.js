var db_sql = require('./db_wrapper');
var squel = require('squel');

function create_resource_tag_link(res_id, tag_id, callback){
    console.log(res_id + " " + tag_id)
        var query = squel.insert()
                    .into('resource_tag')
                    .set('tag_id', tag_id)
                    .set('resource_id', res_id)
                    .toString()
            db_sql.connection.query(query)
                .on('error', function (err) {
                    console.log("error")
                    callback({error: true, err: err});
                })
                .on('end', function () {
                    console.log("finished")
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
            if (err.code != "ER_DUP_ENTRY"){
                response_callback({error: true, err: err});
            }
         })
        .on('end', function () {
            select_tag_id(res_id, tag, response_callback, tag_callback);
        });
}

function select_tag_id(res_id, tag_name, response_callback, tag_callback){
    var select_query = squel.select()
                .from('tag') 
                .field("tag_id")
                .where("tag_name = '" + tag_name + "'")
                .toString()
            db_sql.connection.query(select_query)
                .on('result', function (row) {
                    console.log(row);
                    tag_callback(res_id, row.tag_id, response_callback);
                })
                .on('error', function (err) {
                    console.log('errors')
                    response_callback({error: true, err: err});
                })
                .on('end', function () {
                });
}

function filter_by_tag(tags, callback){
    var query = squel.select()
        .from("resource_tag")
        .field("resource_id")
        .join("tags")
        .on("tag_id")
    for (var i = 0; i < tags.length; i++){
        query.where("tag_name" = tags[i])
    }
    query.toString()

    db_sql.connection.query(query)
                .on('result', function (row) {
                    console.log(row);
                    callback(row);
                })
                .on('error', function (err) {
                    response_callback({error: true, err: err});
                })
                .on('end', function () {
                });

}

function remove_tag_from_resource(res_id, tag_name){}

module.exports = {
    create_tag:create_tag,
    create_resource_tag_link:create_resource_tag_link
}