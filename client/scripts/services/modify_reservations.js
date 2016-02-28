'use strict';

angular.module('resourceTracker')
    .service('modifyReservationsService', function ($http, $q) {

		this.alertMessages = {
			onReservationUpdateSuccess: "Reservation Updated!",
            onReservationUpdateFailure: "Unable to update the reservation. The selected resource has already been reserved " +
                                            "during this time.",
            onReservationDeleteSuccess: "Reservation Deleted!",
            onReservationDeleteFailure: "Unable to delete the reservation. There was an error doing so."
		};

        this.updateReservation = function(start_time, end_time, reservation_id, resource_id) {
            var deferred = $q.defer();
            var reservationData = {start_time: start_time, end_time: end_time,
                reservation_id: reservation_id, resource_id: resource_id};
            var onReservationUpdateSuccess = this.alertMessages.onReservationUpdateSuccess;
            var onReservationUpdateFailure = this.alertMessages.onReservationUpdateFailure;
            $http.post('/reservation', reservationData).then(function(response) {
                deferred.resolve(onReservationUpdateSuccess);
            }, function(error) {
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

