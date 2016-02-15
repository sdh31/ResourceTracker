describe('System Permission Controller Test', function() {
	
	var $controller, $httpBackend;

	beforeEach(function() {
  		module('resourceTracker');
  	});

  	beforeEach(inject(function(_$controller_){
    	$controller = _$controller_;
  	}));

  	beforeEach(inject(function($injector){
  		$httpBackend = $injector.get('$http');
  	}));


  describe('some test...', function() {
    it('some test....', function() {
      var scope = {};
      var ctrl = $controller('SystemPermissionCtrl', {$scope: scope, $http: $httpBackend});



    });
  });
});