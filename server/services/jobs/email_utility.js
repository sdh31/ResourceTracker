var nodemailer = require('nodemailer');

var smtpConfig = {
	    host: 'smtp.gmail.com',
	    port: 465,
	    secure: true, // use SSL
	    auth: {
			user: 'teamscuullc@gmail.com',
			pass: 'Tree1234'
	    }
	};

var transporter = nodemailer.createTransport(smtpConfig);

var sendEmail = function(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
	    if(error){
		    return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
    });
};

var createMailOptions = function(from, to, subject, text, html) {
    var mailOptions = {
	    from: from, // sender address
	    to: to, // list of receivers
	    subject: subject , // Subject line
	    text: text, // plaintext body
	    html: html // html body
    };

    return mailOptions;
};

module.exports.setConfigsAndSendReservationStartingEmail = function(user, resource_blurb) {

    
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation of ' + resource_blurb, 'Hey '+ user.first_name + ',\n\nBe aware that your reservation is starting now!', '');

    sendEmail(mailOptions);
};

module.exports.setConfigsAndSendReservationDeletedEmail = function(user, resource_name, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation of ' + resource_name + ' has been deleted', 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation of ' + resource_name + ', which has been scheduled for ' + new Date(reservation.start_time) + ' has been deleted', '');

    sendEmail(mailOptions);
};

module.exports.setConfigsAndSendCompetingReservationCancelledEmail = function (user, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation of ' + reservation.resources, 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation of ' + reservation.resources + ', which has been scheduled for ' + new Date(reservation.start_time) + ' has been cancelled because a resource manager approved another reservation that competed with yours. Yours was necessarily deleted as a result.', '');

    sendEmail(mailOptions);
};

