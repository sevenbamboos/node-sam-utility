var fs = require('fs'),
		path = require('path'),
		utility = require('./utility'),
		targetPath = process.argv[2];

var dv = new utility.DirVisitor(targetPath);

dv.on('visit-file', function(fn, fs) {
	console.log("[fil]", fn);
	console.log("visit %s files", dv.fileCount);
});

dv.on('visit-folder', function(dn) {
	console.log("[dir]", dn);
	console.log("visit %s folders", dv.folderCount);
});

dv.on('end', function(fc, dc) {
	console.log("scan %s files, %s folders", fc, dc);
	console.timeEnd('disk-cleaning');
});

var cb = function(err, rootDir) {
	if (err) {
		console.error(err.toString());
		process.exit(1);
	}

	if (!rootDir.isDirectory()) {
		console.error("Path %s is not existing or not a directory", targetPath);
		process.exit(2);
	}

	utility.visitDirSync(
			targetPath, 
			fileFilter.bind(null, parseInt(process.argv[3]) || 10 * 1024 * 1024), 
			checkFile,
			endCb);
};

var endCb = function() {

	if (needToDelete) {
		needToDelete.forEach(function(x) {
			console.log("Will delete", x);
		});
	}

	console.timeEnd('disk-cleaning');
};

var lib = {};
var needToDelete = [];

var LibFile = function(fileName) {
	var fn = path.basename(fileName),
			en = path.extname(fn),
			bn = path.basename(fn, en),
			index = bn.search(/-[0-9]/);

	this.fullName = fileName;
	if (index != -1) {
		this.name = bn.substr(0, index);
		this.version = bn.substr(index+1);
	} else {
		this.name = bn;
		this.version = null;
	}
};

var checkFile = function(fileName, fileStat) {
	var libFile = new LibFile(fileName);
	if (!libFile.version) {
		console.log("Stop handling %s since we can't recognize its version.", fileName);
		return;
	}

	var value = null;
	if (!(value = lib[libFile.name])) {
		utility.debug("Keep", libFile.name);
		lib[libFile.name] = libFile;
	} else {
		if (value.version.localeCompare(libFile.version) < 0) {
			utility.debug("Push (%s) %s", libFile.version, value.fullName);
			needToDelete.push(value.fullName);
			lib[libFile.name] = libFile;
		} else if (value.version.localeCompare(libFile.version) > 0) {
			utility.debug("Push2 (%s) %s", value.version, libFile.fullName);
			needToDelete.push(libFile.fullName);
		}	else {
			utility.debug("Skip", libFile);
		}
	}

};

var fileFilter = function(size, fileName, fileStat) {
	return fileSizeGreatThan(size, fileName, fileStat) && fileNameCheck(fileName);
};

var fileNameCheck = function(fileName) {
	return (fileName.endsWith(".jar") && !fileName.endsWith("-sources.jar")) ||
		fileName.endsWith(".zip") || 
		fileName.endsWith(".msi");
};

var fileSizeGreatThan = function(size, fileName, fileStat) {
	return fileStat.size >= size;
};

console.time('disk-cleaning');
//fs.stat(targetPath, cb, endCb);
dv.visit();
