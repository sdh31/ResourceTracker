'use strict';

angular
	.module('resourceTracker',[
		'ngRoute'
	])
	.config(function ($routeProvider) {
    	$routeProvider
            .when('/login', {
        		templateUrl: '/views/login.html',
        		controller: 'LoginCtrl'
      		})
            .when('/register', {
                templateUrl: '/views/register.html',
                controller: 'RegisterCtrl'
            })
            .when('/contact', {
                templateUrl: '/views/contact.html'
            })
            .when('/welcome', {
                templateUrl: '/views/welcome.html'
            })
            .otherwise({
      		    redirectTo: '/login'
      	     });
     });
