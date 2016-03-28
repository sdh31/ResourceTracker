'use strict';

angular.module('resourceTracker')
    .service('modifyReservationsService', function ($http, $q) {

		this.alertMessages = {
			onReservationUpdateSuccess: "Reservation Updated!",
            onReservationUpdateFailure: "Unable to update the reservation. You may only reduce your time range, not extend it.",
            onReservationDeleteSuccess: "Reservation Deleted!",
            onReservationDeleteFailure: "Unable to delete the reservation. There was an error doing so."
		};

        this.updateReservation = function(title, description, start_time, end_time, reservation_id) {
            var deferred = $q.defer();
            var reservationData = {start_time: start_time, end_time: end_time,
                reservation_id: reservation_id, reservation_title: title, reservation_description: description};
            var onReservationUpdateSuccess = this.alertMessages.onReservationUpdateSuccess;
            var onReservationUpdateFailure = this.alertMessages.onReservationUpdateFailure;
            $http.post('/reservation', reservationData).then(function(response) {
                deferred.resolve(onReservationUpdateSuccess);
            }, function(error) {
                console.log(error);
                deferred.reject(onReservationUpdateFailure);
            });
            return deferred.promise;
        };

        this.deleteReservation = function(reservation_id) {
            var deferred = $q.defer();
            var deleteReservationQuery = '/reservation?reservation_id=' + reservation_id;
            var onReservationDeleteSuccess = this.alertMessages.onReservationDeleteSuccess;
            var onReservationDeleteFailure = this.alertMessages.onReservationDeleteFailure;
            $http.delete(deleteReservationQuery).then(function(response) {
                deferred.resolve(onReservationDeleteSuccess);
            }, function(error) {
                deferred.reject(onReservationDeleteFailure);
            });
            return deferred.promise;
        };
     });

