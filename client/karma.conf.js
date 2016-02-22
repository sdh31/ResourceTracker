module.exports = function(config) {
	config.set({
		frameworks: ['jasmine'],
		port:1234,
		files: ['https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.js',
				'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-route.js',
				'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular-animate.js',
				'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-mocks.js',
				'https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js',
				'scripts/app.js',
				'scripts/controllers/main_controller.js',
				'scripts/controllers/system_permission.js',
				'scripts/controllers/create_resource.js',
				'scripts/controllers/edit_user.js',
				'scripts/services/resource.js',
				'tests/*.js']
	});
};

