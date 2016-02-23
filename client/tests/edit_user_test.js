describe('Edit User Test -- ', function() {
    var $httpBackend, $rootScope, initController, resourceService;

    beforeEach(module('resourceTracker'));

    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');

        var controller = $injector.get('$controller');

        initController = function() {
            return controller('EditUserCtrl', {'$scope' : $rootScope });
        };

    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });



    it('correctly updates permissions of user', function() {

        $rootScope.selectedUser = {
            username: 'sdh31'
        };

        $rootScope.usernameToPrivateGroupMap = {
            sdh31: {
                group_name: 'sdh31_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1',
                group_description: 'sdh31_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1',
                is_private: 1,
                user_management_permission: true,
                resource_management_permission: true,
                reservation_management_permission: true,
                group_id: 4
            }
        };

        initController();

        $httpBackend.when('POST', '/group').respond("OK");

        $httpBackend.expectPOST('/group', {
            group_id: 4,
            user_management_permission: true,
            resource_management_permission: true,
            reservation_management_permission: false
        });

        $rootScope.user_ReservationPerm = false;
        $rootScope.updatePermissions();
        
        $httpBackend.flush();

    });



});