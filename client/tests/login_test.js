describe('Login Test -- ', function() {
    var $httpBackend, $rootScope, $scope, initController;

    beforeEach(module('resourceTracker'));

    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.$new();
        $location = $injector.get('$location');

        var controller = $injector.get('$controller');

        initController = function() {
            return controller('MainCtrl', {'$scope' : $scope, '$rootScope' : $rootScope });
        };

    }));


    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('invalid session on init', function() {
        var userResponse = { noSession: true };
        $httpBackend.when('GET', '/user').respond(userResponse);
        $httpBackend.expectGET('/user');

        initController();
        $httpBackend.flush();

        expect($scope.user.username).toEqual('');
        expect($scope.user.loggedIn).toEqual(false);

    });

    it('valid session on init', function() {
        var userResponse = {
            noSession: false,
            first_name: 'Stephen',
            last_name: 'Hughes',
            username: 'sdh31',
            user_management_permission: 1,
            reservation_management_permission: 1,
            resource_management_permission: 1
        };

        spyOn($location, 'url');    
        $httpBackend.when('GET', '/user').respond(userResponse);
        $httpBackend.expectGET('/user');

        initController();
        $httpBackend.flush();

        expect($scope.user.username).toEqual('sdh31');
        expect($scope.user.loggedIn).toEqual(true);
        expect($location.url).toHaveBeenCalledWith('/system_permission');

    });

    it('non shibboleth user login', function() {
        // initially, invalid session
        var userResponse = { noSession: true };

        spyOn($location, 'url');  
        $httpBackend.when('GET', '/user').respond(userResponse);
        $httpBackend.expectGET('/user');

        initController();
        $httpBackend.flush();

        expect($scope.user.username).toEqual('');
        expect($scope.user.loggedIn).toEqual(false);
        expect($location.url).not.toHaveBeenCalled();

        // now, user logs in
        $scope.user = {
            username: 'stevehughes',
            password: 'pass',
        };

        var userResponse = {
            noSession: false,
            first_name: 'Steph',
            last_name: 'Hughes',
            username: 'stevehughes',
            user_management_permission: 0,
            reservation_management_permission: 1,
            resource_management_permission: 1
        };

        $httpBackend.when('POST', '/user/signin').respond(userResponse);
        $httpBackend.expectPOST('/user/signin', $scope.user);
 
        $scope.login();
        $httpBackend.flush();

        expect($scope.user.username).toEqual('stevehughes');
        expect($scope.user.first_name).toEqual('Steph');
        expect($scope.user.loggedIn).toEqual(true);
        expect($location.url).toHaveBeenCalledWith('/user_reservation');

    });

});