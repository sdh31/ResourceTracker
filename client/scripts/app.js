'use strict';

angular
	.module('resourceTracker', ['ngRoute'])
	.config(function ($routeProvider) {
    	$routeProvider
            .when('/login', {
                templateUrl: '/views/login.html'
                // NOTE: do not include controller for this templateUrl so it can default to the same main_controller as index.html
            })
            .when('/register', {
                templateUrl: '/views/register.html',
                controller: 'RegisterCtrl'
            })
            .when('/contact', {
                templateUrl: '/views/contact.html'
            })
            .when('/resource', {
                templateUrl: '/views/resource.html',
                controller: 'MainResourceCtrl'
            })
            .when('/filter_reservation', {
                templateUrl: '/views/filter_reservation.html',
                controller: 'FilterReservationCtrl'
            })
            .when('/manage_reservation', {
                templateUrl: '/views/manage_reservation.html',
                controller: 'ManageReservationCtrl'
            })
            .when('/system_permission', {
                templateUrl: '/views/system_permission.html',
                controller: 'SystemPermissionCtrl'
            })
            .when('/user_reservation', {
                templateUrl: '/views/user_reservation.html',
                controller: 'UserReservationCtrl'
            })
            .when('/resource_permission', {
                templateUrl: '/views/resource_permission.html',
                controller: 'ResourcePermissionCtrl'
            })
            .when('/incomplete_reservations', {
                templateUrl: '/views/incomplete_reservations.html',
                controller: 'IncompleteReservationCtrl'
            })
            .otherwise({
      		    redirectTo: '/login'
      	   });
    })
    .run(function($rootScope, $templateCache) {
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            if (typeof(current) !== 'undefined'){
                $templateCache.remove(current.templateUrl);
            }
         });
    });

