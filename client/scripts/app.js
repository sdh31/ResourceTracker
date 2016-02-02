'use strict';

angular
	.module('resourceTracker', ['ngRoute', 'ui.bootstrap.datetimepicker'])
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
            .when('/reservation', {
                templateUrl: '/views/reservation.html',
                controller: 'ReservationCtrl'
            })
            .otherwise({
      		    redirectTo: '/login'
      	   });
     });

