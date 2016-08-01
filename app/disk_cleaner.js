var fs = require('fs'),
		util = require('./util'),
		targetPath = process.argv[2];

var cb = function(err, rootDir) {
	if (err) {
		console.error(err.toString());
		process.exit(1);
	}

	if (!rootDir.isDirectory()) {
		console.error("Path %s is not existing or not a directory", targetPath);
		process.exit(2);
	}

	util.visitDirSync(targetPath, fileSizeGreatThan.bind(null, parseInt(process.argv[3]) || 10 * 1024 * 1024), endCb);
};

var endCb = function() {
	console.timeEnd('visitFiles');
};

var showFileInfo = function(fileName, fileStat) {
	console.log("File %s mtime %s size %s", 
			fileName, 
			fileStat.mtime.toLocaleString(), 
			util.fileSizeInK(fileStat.size)
	);
};

var fileSizeGreatThan = function(size, fileName, fileStat) {
	if (fileStat.size >= size) {
		showFileInfo(fileName, fileStat);
	}
};

console.time('visitFiles');
fs.stat(targetPath, cb, endCb);
