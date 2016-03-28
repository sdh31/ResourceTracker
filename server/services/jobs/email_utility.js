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

module.exports.sendReservationStartingEmail = function(user, resource_blurb) {

    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation of ' + resource_blurb, 'Hey '+ user.first_name + ',\n\nBe aware that your reservation is starting now!', '');

    sendEmail(mailOptions);
};

module.exports.sendReservationNotYetApprovedEmail = function(user, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation for ' + new Date(reservation.start_time), 'Hey '+ user.first_name + " " + user.last_name + ',\n\nThis is a warning that your reservation that is scheduled for ' + new Date(reservation.start_time) + ' still needs one or more approvals ', '');

    sendEmail(mailOptions);
};

module.exports.sendReservationCancelledDueToResourcesNotApprovedInTimeEmail = function(user, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation for ' + new Date(reservation.start_time), 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation which had been scheduled for ' + new Date(reservation.start_time) + ' has been cancelled because all of the restricted resources had not been approved in time. Please try again! ' , '');

    sendEmail(mailOptions);
};

module.exports.sendReservationCancelledOnResourceDenialEmail = function(user, reservation, resource_name) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation for ' + new Date(reservation.start_time), 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation which had been scheduled for ' + new Date(reservation.start_time) + ' has been cancelled because a resource manager denied your request for ' + resource_name + '.', '');

    sendEmail(mailOptions);
};

module.exports.sendReservationDeletedEmail = function(user, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation for ' + new Date(reservation.start_time), 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation called ' + reservation.reservation_title +' which had been scheduled for ' + new Date(reservation.start_time) + ' has been deleted', '');

    sendEmail(mailOptions);
};

module.exports.sendCompetingReservationCancelledEmail = function (user, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation of ' + reservation.resources, 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation of ' + reservation.resources + ', which had been scheduled for ' + new Date(reservation.start_time) + ' has been cancelled because a resource manager approved another reservation that competed with yours. Yours was necessarily deleted as a result.', '');

    sendEmail(mailOptions);
};

