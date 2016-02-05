var db_sql = require('./db_wrapper');
var squel = require('squel');
var agenda = require('./agenda');

function generate_conflict_expression(reservation){
    var time_check = squel.expr()
        .or_begin()
            .and("reservation.start_time >= " + reservation.start_time)
            .and("reservation.start_time <= " + reservation.end_time)
        .end()
        .or_begin()
            .and("reservation.end_time >= " + reservation.start_time)
            .and("reservation.end_time <= " + reservation.end_time)
        .end();
        return time_check;
}

function get_conflicting_reservations(user, reservation, callback, no_conflict_callback){
    /*
    return resource specified by name (might have to change to id if names aren't unique)
    name: resource name
    */
    //Generate SQL logic to check for conflicting values
    var time_check = generate_conflict_expression(reservation);

    var query = squel.select()
        .from("reservation")
        //.join("resource", null, "resource.resource_id=reservation.resource_id")
        .where(time_check)
        //TODO: get resource_id based on reservation_id?
        .where("reservation.resource_id = " + reservation.resource_id)
        //NOTE: If the reservation_id is provided, don't include that reservation in conflicts
        if("reservation_id" in reservation){
            query = query.where("reservation_id !=" + reservation.reservation_id)
        }
        query = query.order("reservation.resource_id")
        .toString()

    console.log(query);
    var row_count = 0;
    response_values = [];
    db_sql.connection.query(query)
        .on('result', function (row) {
            row_count ++;
            console.log(row)
            
     })
    .on('error', function (err) {
        callback({error: true, err: err})
     })
    .on('end', function (err){
        if (row_count == 0){
            no_conflict_callback(user, reservation, callback);
        }
        else{
            //TODO: Going to need to change what we do here ... Maybe another callback field?
            callback({error: true, err: 'conflict found!'})
        }
    });
}

function create_reservation(user, reservation, callback){
        var query = squel.insert()
            .into("reservation")
            .set("start_time", reservation.start_time)
            .set("end_time", reservation.end_time)
            .set("resource_id", reservation.resource_id)
            .toString()
            console.log(query)
            db_sql.connection.query(query)
                .on('result', function (row) {
                    var res = {
                        start_time: reservation.start_time,
                        end_time: reservation.end_time,
                        resource_id: reservation.resource_id,
                        reservation_id: row.insertId
                    };
                    scheduleEmailForReservation(user, res, callback);
                    console.log("INSERTED" + JSON.stringify(row))
                })
                .on('error', function (err) {
                    console.log(err)
                    callback({error: true, err: err})
                });
       //         .on('end', function (err){

         //           callback({error: false})
           //     });
    }

function delete_reservation_by_id(reservation, callback){
    var query = squel.delete()
        .from("reservation")
        .where("reservation_id = '" + reservation.reservation_id + "'")
        .toString();

        db_sql.connection.query(query)                
                .on('error', function (err) {
                    console.log(err)
                    callback({error: true, err: err})
                })
                .on('end', function (err){
                    callback({error: false})
                });

}

function update_reservation_by_id(reservation, callback){
    var query = squel.update()
        .table("reservation")
        .where("reservation_id=" + reservation.reservation_id)
        .set("start_time", reservation.start_time)
        .set("end_time", reservation.end_time)
        .toString()
        console.log(query)
    db_sql.connection.query(query)                
            .on('error', function (err) {
                console.log(err)
                callback({error: true, err: err})
            })
            .on('end', function (err){
                callback({error: false})
            });


}

function scheduleEmailForReservation(user, reservation, callback) {
    if (user.emailsEnabled == false) {
        console.log("YOUR EMAILS AINT ENABLED BRUH");
        callback({error: false});
    } else {
        var data = {
            user: user,
            reservation: reservation
        };

        agenda.schedule(new Date(reservation.start_time), 'send email', data);
       // agenda.now('send email', data);
        callback({error: false});
    }
};


module.exports = {
    get_conflicting_reservations:get_conflicting_reservations,
    create_reservation:create_reservation,
    delete_reservation_by_id:delete_reservation_by_id,
    update_reservation_by_id:update_reservation_by_id
}
