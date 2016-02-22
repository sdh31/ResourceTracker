
describe('System Permission Controller Test -- ', function() {
   var $httpBackend, $rootScope, initController;

   beforeEach(module('resourceTracker'));

   beforeEach(inject(function($injector) {

     $httpBackend = $injector.get('$httpBackend');
     $rootScope = $injector.get('$rootScope');

     var controller = $injector.get('$controller');

     initController = function() {
       return controller('SystemPermissionCtrl', {'$scope' : $rootScope });
     };

   }));


   afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });


   it('correctly populates public and private groups', function() {
        var groupResponse = {results: [
            {   group_name: 'admin_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1',
                is_private: 1,
                group_id: 1,
                reservation_management_permission: 1,
                resource_management_permission: 1,
                user_management_permission: 1
            },
            {   group_name: 'stevehughes_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1',
                is_private: 1,
                group_id: 2,
                reservation_management_permission: 0,
                resource_management_permission: 0,
                user_management_permission: 0
            },
            {
                group_name: "group1",
                is_private: 0,
                group_id: 4,
                reservation_management_permission: 0,
                resource_management_permission: 0,
                user_management_permission: 0
            }
        ]};

        var userResponse = {results: [
            {   email_address: 'admin@admin.com',
                first_name: 'admin',
                last_name: 'admin',
                user_id: 1,
                username: 'admin'
            },
            {   email_address: 'stevehughes@gmail.com',
                first_name: 'Steve',
                last_name: 'Hughes',
                user_id: 2,
                username: 'stevehughes'
            },
            {   email_address: 'sdh31@duke.edu',
                first_name: 'Stephen',
                last_name: 'Hughes',
                user_id: 7,
                username: 'sdh31'
            }
        ]};

        $httpBackend.when('GET', '/group').respond(groupResponse);
        $httpBackend.when('GET', '/user/all').respond(userResponse);

        $httpBackend.expectGET('/group');
        $httpBackend.expectGET('/user/all');
        var controller = initController();
        $httpBackend.flush();

        // handles private groups
        expect($rootScope.usernameToPrivateGroupMap['stevehughes']['group_name']).toEqual('stevehughes_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1');
        expect($rootScope.usernameToPrivateGroupMap['admin']).not.toBeDefined();
        expect($rootScope.usernameToPrivateGroupMap['group1']).not.toBeDefined();

        // handles public groups
        expect($rootScope.publicGroupList.length).toEqual(1);
        expect($rootScope.publicGroupList[0]['group_name']).toEqual('group1');

        // handles users
        expect($rootScope.absoluteUserList.length).toEqual(2);
        expect($rootScope.absoluteUserList).toEqual([userResponse.results[1], userResponse.results[2]])

   });

});