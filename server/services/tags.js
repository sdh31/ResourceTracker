var db_sql = require('./db_wrapper');
var squel = require('squel');

function create_resource_tag_link(res_id, tag_id, callback){
    console.log(tag_id)
    var rows_to_add = [];
     for(var i = 0; i < tag_id.length; i++){
        var row = {"tag_id": tag_id[i], "resource_id": res_id};
        rows_to_add.push(row);
        console.log(rows_to_add);
    }
        var query = squel.insert()
                    .into('resource_tag')
                    .setFieldsRows(rows_to_add)
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
    var rows_to_add = []
    console.log('create_tag');
    for(var i = 0; i < tag.length; i++){
        var row = {"tag_name": tag[i]};
        rows_to_add.push(row);
        console.log(rows_to_add);
    }
    console.log('create tag II')
    var query = squel.insert()
        .into('tag')
        .setFieldsRows(rows_to_add)
        .toString()
        console.log(query);


        db_sql.connection.query(query)
        .on('error', function (err) {
            if (err.code != "ER_DUP_ENTRY"){
                response_callback({error: true, err: err});
            }
         })
        .on('end', function () {
            console.log('finished!')
            select_tag_id(res_id, tag, response_callback, tag_callback);
        });
}

function select_tag_id(res_id, tags, response_callback, tag_callback){
    var select_expression = squel.expr();
    for (var i = 0; i < tags.length; i++){
        select_expression.or("tag_name = '" + tags[i] + "'")
    }
    var select_query = squel.select()
                .from('tag') 
                .field("tag_id")
                .where(select_expression)
                .toString()
    var tag_ids = [];
    db_sql.connection.query(select_query)
        .on('result', function (row) {
            tag_ids.push(row.tag_id);
                    
        })
        .on('error', function (err) {
            console.log(err)
            response_callback({error: true, err: err});
        })
        .on('end', function () {
            console.log(tag_ids)
            tag_callback(res_id, tag_ids, response_callback);
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
                    if (resources.indexOf(row.resource_id) < 0){
                       resources.push(row.resource_id)
                    }
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