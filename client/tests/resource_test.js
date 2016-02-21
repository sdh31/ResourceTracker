describe('Create and View Resource Test -- ', function() {
    var $httpBackend, $rootScope, initController, resourceService;

    beforeEach(module('resourceTracker'));

    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');

        $rootScope.clearSuccess = function() {};
        $rootScope.clearError = function() {};
        $rootScope.addSuccess = function() {};
        $rootScope.addError = function() {};

        resourceService = $injector.get('resourceService');

        var controller = $injector.get('$controller');

        initController = function() {
            return controller('CreateResourceCtrl', {'$scope' : $rootScope, 'resourceService': resourceService });
        };

    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('creates a resource via API, then adds tags to resource', function() {
        $httpBackend.whenPUT('/resource').respond({insertId: 1});
        $httpBackend.whenPUT('/tag').respond('OK');

        initController();

        $rootScope.newResource = {
            name: 'resource1',
            description: 'description of resource 1',
            tags: ['tag1', 'tag2']
        };

        $httpBackend.expectPUT('/resource', $rootScope.newResource);
        $httpBackend.expectPUT('/tag', {resource_id: 1, addedTags: ['tag1', 'tag2']});

        $rootScope.createResource();
        $httpBackend.flush();

   });

    it('successfully adds a tag to resource through UI', function() {
        spyOn($rootScope, 'addError');

        initController();

        $rootScope.newResource = {
            name: 'resource1',
            description: 'description of resource 1',
            tags: ['tag1', 'tag2']
        };

        $rootScope.activeTag = 'tag3';
        $rootScope.addCreateTag();

        expect($rootScope.newResource.tags).toEqual(['tag1', 'tag2', 'tag3']);
        expect($rootScope.addError).not.toHaveBeenCalled();
   });


    it('fails to a tag to resource through UI', function() {
        spyOn($rootScope, 'addError');

        initController();

        $rootScope.newResource = {
            name: 'resource1',
            description: 'description of resource 1',
            tags: ['tag1', 'tag2']
        };

        $rootScope.activeTag = 'tag2';
        $rootScope.addCreateTag();

        expect($rootScope.newResource.tags).toEqual(['tag1', 'tag2']);
        expect($rootScope.addError).toHaveBeenCalled();
   });

    it('removes tags from resource through UI', function() {
        initController();

        $rootScope.newResource = {
            name: 'resource1',
            description: 'description of resource 1',
            tags: ['tag1', 'tag2']
        };

        $rootScope.removeCreateTag(1);
        expect($rootScope.newResource.tags).toEqual(['tag1']);
        $rootScope.removeCreateTag(0);
        expect($rootScope.newResource.tags).toEqual([]);
   });

});