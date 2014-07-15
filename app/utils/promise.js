var mPromise = require('mongoose').Promise
exports.newPromise = function(fn) {
	var finalPromise = new mPromise;
	var promise = new mPromise;
	promise
		.then(fn)
		.then(function() {
				finalPromise.fulfill.apply(finalPromise, arguments);
			},
			function(err) {
				// reject if fn is rejected or has an error
				finalPromise.reject(err);
			});

	promise.fulfill();
	return finalPromise;
}