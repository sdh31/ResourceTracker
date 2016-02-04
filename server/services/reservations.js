var db_sql = require('./db_wrapper');
var squel = require('squel');

function get_resource_by_name(reservation, callback){
    /*
    return resource specified by name (might have to change to id if names aren't unique)
    name: resource name
    */
    var start_check = squel.expr()
        .and("start_time >= " + reservation.start_time)
        .and("start_time <= " + reservation.end_time);

    var end_check = squel.expr()
        .and("end_time >= " + reservation.start_time)
        .and("end_time <= " + reservation.end_time);
    
    var time_check = squel.expr()
        .or(start_check)
        .or(end_check)

    var query = squel.select()
        .from("reservation")
        .where(time_check)
        .where("resource_id = " + reservation.resource_id)
        .toString()



        
   /* db_sql.connection.query(query)
    .on('result', function (row) {
            
     })
    .on('error', function (err) {
           
     })
    .on('end', function (err){
        
    });*/
}