var db_sql = require('../db_wrapper');
var squel = require('squel');
var nodemailer = require('nodemailer');

var smtpConfig = {
	    host: 'smtp.gmail.com',
	    port: 465,
	    secure: true, // use SSL
	    auth: {
			user: 'ericichonglam17@gmail.com',
			pass: 'Tree1234'
	    }
	};

var transporter = nodemailer.createTransport(smtpConfig);

var setConfigsAndSend = function(user, resource_name) {
    var mailOptions = {
	    from: 'Hypotheticorp LLC <asdf@gmail.com>', // sender address
	    to: user.email_address, // list of receivers
	    subject: 'Your reservation of ' + resource_name, // Subject line
	    text: 'Hey '+ user.first_name + ',\n\nBe aware that your reservation is starting now!', // plaintext body
	    html: '' // html body
    };

    transporter.sendMail(mailOptions, function(error, info){
	    if(error){
		    return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
    });
};

module.exports = function(agenda) {
	// job.attrs.data has information regarding the job
	agenda.define('send email', function(job) {

        var getUserInfoQuery = squel.select().from("user").where("user.username = '" + job.attrs.data.user.username + "'").toString();

        console.log(getUserInfoQuery);
        db_sql.connection.query(getUserInfoQuery)
            .on('result', function (row) {
                if (row.emails_enabled == 1) {
                    getUserInfoCallback(row);
                } else {
                    console.log("EMAILS AINT ENABLED ANYMORE BRUH");
                }
            })
            .on('error', function (err) {
                console.log("error in checking users email settings when scheduling email");
                //callback({error: true, err: err});
            })

        var getUserInfoCallback = function(userInfo) {
            var reservationExistsQuery = squel.select().from("reservation").where("reservation.reservation_id = '" + job.attrs.data.reservation.reservation_id + "'").toString();

            console.log(reservationExistsQuery);

            // only continue sending email if the reservation still exists
            db_sql.connection.query(reservationExistsQuery)
                .on('result', function (row) {
                    if (row.start_time == job.attrs.data.reservation.start_time) {
                        reservationExistsCallback(userInfo);
                    }
                })
                .on('error', function (err) {
                    console.log("error in finding reservation when scheduling email");
                    //callback({error: true, err: err});
                })
        }

        var reservationExistsCallback = function(userInfo) {
            var resourceNameQuery = squel.select().from("resource").where("resource.resource_id = '" + job.attrs.data.reservation.resource_id + "'").toString();
            console.log(resourceNameQuery);

            db_sql.connection.query(resourceNameQuery)
                .on('result', function (row) {
                    resourceNameQueryCallback(userInfo, row.name);
                })
                .on('error', function (err) {
                    console.log("error in finding resource name when scheduling email");
                    //callback({error: true, err: err});
                })
        };

        var resourceNameQueryCallback = function (userInfo, resource_name) {
		    setConfigsAndSend(userInfo, resource_name);
        };
	});
}


