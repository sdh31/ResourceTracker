var db_sql = require('../db_wrapper');
var squel = require('squel');
var email_utility = require('./email_utility');
var user_service = require('../users');
var reservation_service = require('../reservations');
var resource_service = require('../resources');

module.exports = function(agenda) {

    agenda.define('notify on delete reservation', function(job) {
        email_utility.setConfigsAndSendReservationDeletedEmail(job.attrs.data.user, job.attrs.data.resource_name, job.attrs.data.reservation);
    });

    agenda.define('notify on competing reservation cancellation', function(job) {
        email_utility.setConfigsAndSendCompetingReservationCancelledEmail(job.attrs.data.user, job.attrs.data.reservation);
    });
	// job.attrs.data has information regarding the job
	agenda.define('send email', function(job) {

        var userInfo = {};
        var resourcesInfoQueryCallback = function (result) {
            // can change this to include the actual resources..
		    email_utility.setConfigsAndSendReservationStartingEmail(userInfo, result.results.length + ' resources');
        };

        var reservationExistsCallback = function(result) {
            if (result.results.start_time == job.attrs.data.reservation.start_time) {
                /*var resource_ids = [];
                var resources = job.attrs.data.reservation.resources;
                for (var i = 0; i<resources.length; i++) {
                    resource_ids.push(resources[i].resource_id);
                }
                resource_service.get_resources_by_ids(resource_ids, resourcesInfoQueryCallback);*/
                email_utility.setConfigsAndSendReservationStartingEmail(userInfo, job.attrs.data.reservation.resources.length + ' resources');
            }
        };

        var getUserInfoCallback = function(result) {
            userInfo = result.results;
            reservation_service.get_reservation_by_id(job.attrs.data.reservation, reservationExistsCallback);
        };

        user_service.get_user_permissions(job.attrs.data.user, getUserInfoCallback);

	});
}

