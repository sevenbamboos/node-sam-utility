var fs = require('fs'),
		path = require('path'),
		utility = require('./utility');

var mavenCleaner = new utility.DirVisitor();
mavenCleaner.willDelete = 0;

var needToDelete = [],
		lib = {};

mavenCleaner.on('error', function(err) {
	console.error(err.toString());
	process.exit(1);
});

mavenCleaner.on('visit-file', function(fn, fs) {
	if (Math.random() > 0.999) { // try to reduce the count of printing
		process.stdout.write("Files: " + mavenCleaner.fileCount + "\033[0G");
	}
	var func = checkMavenRepo().bind(null, lib, needToDelete, this.size)
	func.call(null, fn, fs);
});

mavenCleaner.on('visit-folder', function(dn) {
});

mavenCleaner.on('end', function(fc, dc) {
	var self = this;
	if (needToDelete) {
		needToDelete.forEach(function(x) {
			deleteParentDir(x, self);
		});
	}

	if (this.test) {
		console.log("Can release", utility.fileSizeInM(this.willDelete));
	}

	console.log("scanned %s files, %s folders", fc, dc);
	console.timeEnd('maven-cleaner');

});

var deleteParentDir = function(dir, cleaner) {
	var parentDir = path.dirname(dir);
	if (cleaner.test) {
		console.log("Will delete", parentDir);
		cleaner.willDelete += fs.statSync(dir).size;
	} else {
		utility.deleteDirSync(parentDir);
	}
};

var checkMavenRepo = function() {
	var checkFileName = function(fileName) {
		return (fileName.endsWith(".jar") && !fileName.endsWith("-sources.jar")) ||
			fileName.endsWith(".zip"); 
	};

	var fileSizeGreatThan = function(fs, size) {
		return fs.size >= size;
	};

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

	return function(lib, needToDelete, size, fileName, fileStat) {
		
		if (!checkFileName(fileName) || !fileSizeGreatThan(fileStat, size)) {
			return;
		}

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
				utility.debug("Delete %s of %s since having newer %s", libFile.name, value.version, libFile.version);
				needToDelete.push(value.fullName);
				lib[libFile.name] = libFile;
			} else if (value.version.localeCompare(libFile.version) > 0) {
				utility.debug("Discard %s of %s since the newer %s", libFile.name, libFile.version, value.version);
				needToDelete.push(libFile.fullName);
			}	else {
				utility.debug("Skip", libFile);
			}
		}
	};
};

exports.cleanMaven = function(targetPath, onlyTest, size) {
	needToDelete = [],
	lib = {};
	mavenCleaner.test = onlyTest === "test";
	mavenCleaner.size = parseInt(size) || 1024 * 1024;

	console.time('maven-cleaner');
	mavenCleaner.reset(targetPath, function(visitor) {
		visitor.visit();
	});
};
