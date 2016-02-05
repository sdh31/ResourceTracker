var mongodb = require('mongodb');
var Agenda = require('agenda');

var agenda = new Agenda({db: { address: 'localhost:27017/agenda-test' }});

// can do some cool looping for jobs if we need more types - shown on Agenda github page

require('./jobs/email_jobs')(agenda);

agenda.on('ready', function() {
	agenda.start();
});

module.exports = agenda;
