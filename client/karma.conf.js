module.exports = function(config) {
	config.set({
		frameworks: ['jasmine'],
		port:1234,
		files: ['tests/*.js']
	});
};
