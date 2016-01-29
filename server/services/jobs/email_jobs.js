var nodemailer = require('nodemailer');

module.exports = function(agenda) {

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

	// job.attrs.data has information regarding the job
	agenda.define('send email', function(job) {

		var mailOptions = {
			from: 'Eric I Chong Lam LLC <asdf@gmail.com>', // sender address
			to: job.attrs.data.user.email, // list of receivers
			subject: 'Your reservation of ' + job.attrs.data.resource.name, // Subject line
			text: 'Hey '+ job.attrs.data.user.username + ',\n\nBe aware that your reservation is starting now!', // plaintext body
			html: '' // html body
		};

	 	transporter.sendMail(mailOptions, function(error, info){
			if(error){
				return console.log(error);
			}
			console.log('Message sent: ' + info.response);
		});
	});
}
