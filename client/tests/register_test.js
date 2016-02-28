describe('Register Test -- ', function() {
    var $httpBackend, $rootScope, $scope, initController;

    beforeEach(module('resourceTracker'));

    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $rootScope.addSuccess = function() {};
        $rootScope.clearSuccess = function() {};
        $rootScope.addError = function() {};
        $rootScope.clearError = function() {};


        $location = $injector.get('$location');

        var controller = $injector.get('$controller');

        initController = function() {
            return controller('RegisterCtrl', {'$scope' : $rootScope });
        };

    }));


    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('successfully registers new user', function() {
        initController();

        $rootScope.newUser.first_name = 'Stephen';
        $rootScope.newUser.last_name = 'Hughes';
        $rootScope.newUser.username = 'sdh31';
        $rootScope.newUser.email = 'sdh31@duke.edu';
        $rootScope.newUser.password = 'password';
        $rootScope.newUser.confirmPassword = 'password';
        $rootScope.newUser.isShibboleth = false;

        $httpBackend.expectPUT('/user', $rootScope.newUser);
        $httpBackend.when('PUT', '/user').respond("OK");

        $rootScope.register();
        $httpBackend.flush();

    });

    it('fails to register new user due to password mismatch', function() {
        initController();

        $rootScope.newUser.first_name = 'Stephen';
        $rootScope.newUser.last_name = 'Hughes';
        $rootScope.newUser.username = 'sdh31';
        $rootScope.newUser.email = 'sdh31@duke.edu';
        $rootScope.newUser.password = 'password';
        $rootScope.newUser.confirmPassword = 'confirm_password';
        $rootScope.newUser.isShibboleth = false;

        spyOn($rootScope, 'addError')
        $rootScope.register();
        expect($rootScope.addError).toHaveBeenCalledWith('Passwords do not match.');

    });

});