var db_sql = require('../db_wrapper');
var squel = require('squel');
var email_utility = require('./email_utility');
var user_service = require('../users');
var reservation_service = require('../reservations');
var resource_service = require('../resources');

module.exports = function(agenda) {

    // job.attrs.data has information regarding the job

    agenda.define('notify on delete reservation', function(job) {
        email_utility.sendReservationDeletedEmail(job.attrs.data.user, job.attrs.data.reservation);
    });

    agenda.define('notify on competing reservation cancellation', function(job) {
        email_utility.sendCompetingReservationCancelledEmail(job.attrs.data.user, job.attrs.data.reservation);
    });

    agenda.define('notify on resource denial', function(job) {
        email_utility.sendReservationCancelledOnResourceDenialEmail(job.attrs.data.user, job.attrs.data.reservation, job.attrs.data.resource_name);
    });

    agenda.define('remind if reservation is incomplete', function(job) {
        var getReservationCallback = function(result) {
            if (result.error) {
                console.log('error in check if reservation is incomplete -- get reservation');
            } else {
                // this is a list because the function expects an array - only going to be 1 element
                var reservation_list = reservation_service.organizeReservations(result.results);
                if ((job.attrs.data.reservation.start_time == reservation_list[0].start_time) && reservation_service.filterAllowedOverlappingReservations(reservation_list).length == 0) {
                    /// schedule another reminder email here??
                    email_utility.sendReservationNotYetApprovedEmail(job.attrs.data.user, reservation_list[0]);
                }
            }
        };
        reservation_service.get_reservation_by_id(job.attrs.data.reservation, getReservationCallback);
    });

    agenda.define('notify on reservation starting when still incomplete', function(job) {
        var deleteReservationCallback = function(result) {
            if (result.error) {
                console.log('error in notify on reservation starting when still incomplete -- delete reservation');
            }
        };

        var getReservationCallback = function(result) {
            if (result.error) {
                console.log('error in notify on reservation starting when still incomplete -- get reservation');
            } else {
                // this is a list because the function expects an array - only going to be 1 element
                var reservation_list = reservation_service.organizeReservations(result.results);

                if ((job.attrs.data.reservation.start_time == reservation_list[0].start_time) && reservation_service.filterAllowedOverlappingReservations(reservation_list).length == 0) {
                    email_utility.sendReservationCancelledDueToResourcesNotApprovedInTimeEmail(job.attrs.data.user, reservation_list[0]);
                    reservation_service.delete_reservation_by_id(reservation_list[0], deleteReservationCallback);
                }
            }
        };
        reservation_service.get_reservation_by_id(job.attrs.data.reservation, getReservationCallback);
    });

	agenda.define('notify on reservation starting', function(job) {

        var userInfo = {};

        var reservationExistsCallback = function(result) {
            if (result.results[0].start_time == job.attrs.data.reservation.start_time) {
                email_utility.sendReservationStartingEmail(userInfo, result.results[0]);
            }
        };

        var getUserInfoCallback = function(result) {
            userInfo = result.results;
            reservation_service.get_reservation_by_id(job.attrs.data.reservation, reservationExistsCallback);
        };

        user_service.get_user_permissions(job.attrs.data.user, getUserInfoCallback);

	});
}

