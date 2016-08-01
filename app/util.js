var fs = require('fs'),
		path = require('path');

exports.fileSizeInM = function(size) {
	return (size/1024/1024).toFixed(2) + "M";
};

exports.fileSizeInK = function(size) {
	return (size/1024).toFixed(2) + "K";
};

function _visitDirSync(dir, fileFilter, cb, endCb) {
	var files = fs.readdirSync(dir);
	files.forEach(function(f) { 
		var fileName = path.join(dir, f);
		var file = fs.statSync(fileName);
		if (file.isFile() && fileFilter(fileName, file)) {
			cb(fileName, file);
		} else if (file.isDirectory()) {
			_visitDirSync(fileName, fileFilter, cb);
		}
	});

	if (endCb) {
		endCb();
	}
}

exports.visitDirSync = _visitDirSync;

var enableDebug = false;
exports.debug = function() {
	if (enableDebug) {
		console.log.apply(null, arguments);
	}
};	
