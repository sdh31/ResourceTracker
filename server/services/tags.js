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
                    tag_callback(res_id, row.tag_id, response_callback);
                })
                .on('error', function (err) {
                    console.log(err)
                    response_callback({error: true, err: err});
                })
                .on('end', function () {
                });
}

function filter_by_tag(tags, callback){
    var tag_filter = squel.expr()
    for (var i = 0; i < tags.length; i++){
        tag_filter.or("tag_name = '" + tags[i] + "'")
    }
    var query = squel.select()
        .from("resource_tag")
        
        //can add more joins (i.e. reservations, resources if more info is needed in return)
        .join("tag", null, "resource_tag.tag_id = tag.tag_id")
        .where(tag_filter)
    query = query.toString()
    console.log(query)
    var resources = []

    db_sql.connection.query(query)
                .on('result', function (row) {
                    resources.push(row.resource_id)
                })
                .on('error', function (err) {
                    console.log(err)
                    callback({error: true, err: err});
                })
                .on('end', function () {
                    callback({resource_id:resources})
                });

}


module.exports = {
    create_tag:create_tag,
    create_resource_tag_link:create_resource_tag_link,
    filter_by_tag:filter_by_tag
}