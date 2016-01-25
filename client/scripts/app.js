'use strict';

angular
	.module('resourceTracker',[
		'ngRoute'
	])
	.config(function ($routeProvider) {
    	$routeProvider
    		.when('/', {
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
      	.otherwise({
      		redirectTo: '/'
      	});
     });
