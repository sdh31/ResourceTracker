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

module.exports.sendReservationStartingEmail = function(user, reservation) {

    var resourcesString = '';
    for (var i = 0; i<reservation.resources.length; i++) {
        resourcesString += reservation.resources[i].name;
        if (i != reservation.resources.length - 1) {
            resourcesString += ' ,';
        }
    }
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation ' + reservation.reservation_title, 'Hey '+ user.first_name + ',\n\nBe aware that your reservation is starting now! The resources on this reservation are: ' + resourcesString, '');

    sendEmail(mailOptions);
};

module.exports.sendReservationNotYetApprovedEmail = function(user, reservation) {

    var resourcesString = getResourceStringForUnconfirmedResources(reservation);

    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation ' + reservation.reservation_title, 'Hey '+ user.first_name + " " + user.last_name + ',\n\nThis is a warning that your reservation called ' + reservation.reservation_title + ' that is scheduled for ' + new Date(reservation.start_time) + ' still needs one or more approvals. The approvals are needed for: ' + resourcesString, '');

    sendEmail(mailOptions);
};

module.exports.sendReservationCancelledDueToResourcesNotApprovedInTimeEmail = function(user, reservation) {

    var resourcesString = getResourceStringForUnconfirmedResources(reservation);

    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation ' + reservation.reservation_title, 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation called ' + reservation.reservation_title + ' which had been scheduled for ' + new Date(reservation.start_time) + ' has been cancelled because all of the restricted resources had not been approved in time. Please try again! The resources that were missing permissions were: ' + resourcesString , '');

    sendEmail(mailOptions);
};

module.exports.sendReservationCancelledOnResourceDenialEmail = function(user, reservation, resource_name) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation ' + reservation.reservation_title, 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation which had been scheduled for ' + new Date(reservation.start_time) + ' has been cancelled because a resource manager denied your request for ' + resource_name + '.', '');

    sendEmail(mailOptions);
};

module.exports.sendReservationDeletedEmail = function(user, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation ' + reservation.reservation_title, 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation called ' + reservation.reservation_title +' which had been scheduled for ' + new Date(reservation.start_time) + ' has been deleted', '');

    sendEmail(mailOptions);
};

module.exports.sendCompetingReservationCancelledEmail = function (user, reservation) {
    var mailOptions = createMailOptions('Hypotheticorp LLC <asdf@gmail.com>', user.email_address, 'Your reservation  ' + reservation.reservation_title, 'Hey '+ user.first_name + " " + user.last_name + ',\n\nSadly, your reservation ' + reservation.reservation_title + ', which had been scheduled for ' + new Date(reservation.start_time) + ' has been cancelled because a resource manager approved another reservation that competed with yours. Yours was necessarily deleted as a result.', '');

    sendEmail(mailOptions);
};

var getResourceStringForUnconfirmedResources = function(reservation) {
    var resourcesString = '\n';
    for (var i = 0; i<reservation.resources.length; i++) {
        if (reservation.resources[i].is_confirmed == 0) {
            resourcesString += reservation.resources[i].name + '\n';
        }
    }
    return resourcesString;
};

