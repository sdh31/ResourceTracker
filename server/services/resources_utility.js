var resourceExists = function(thisResource, resources) {
	for (var i = 0; i<resources.length; i++) {
		if (thisResource.resource_id == resources[i].resource_id) {
			return i;
		}
	}
	return -1;
};

var organizeResources = function(resources) {

	var resourcesToSend = [];
	for (var i = 0; i<resources.length; i++) {
		var thisResource = resources[i];
		var index = resourceExists(thisResource, resourcesToSend);
		if (index != -1) {
			resourcesToSend[index].tags.push(thisResource.tag_name);
		} else {
			var tag = (thisResource.tag_name == null) ? null : [thisResource.tag_name];
			var resource = {
				name: thisResource.name,
				description: thisResource.description,
				max_users: thisResource.max_users,
				tags: tag,
				resource_id: thisResource.resource_id
			};
			resourcesToSend.push(resource);
		}
	}
	return resourcesToSend;
};

module.exports = {
	organizeResources : organizeResources
};
