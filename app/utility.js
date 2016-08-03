var fs = require('fs'),
		path = require('path'),
		util = require('util'),
		events = require('events');

var enableDebug = false;
exports.debug = function() {
	if (enableDebug) {
		console.log.apply(null, arguments);
	}
};	

exports.fileSizeInM = function(size) {
	return (size/1024/1024).toFixed(3) + "M";
};

exports.fileSizeInK = function(size) {
	return (size/1024).toFixed(3) + "K";
};

function deleteDirSync(dir) {
	var fstat = null;
	try {
		fstat = fs.statSync(dir);
	} catch (err) {
		console.error(err.toString());
		return;
	}

	if (fstat.isFile()) {
		console.log("[rm]", dir);
		fs.unlinkSync(dir);

	} else if (fstat.isDirectory()) {
		var children = fs.readdirSync(dir);
		children.forEach(function(fn) {
			var filePath = path.join(dir, fn);
			deleteDirSync(filePath);
		});

		fs.rmdirSync(dir);

	} else {
		throw "Unknown dir " + fstat;
	}
}

exports.deleteDirSync = deleteDirSync;

// dir visitor start

function DirVisitor() {
	events.EventEmitter.call(this);
}

util.inherits(DirVisitor, events.EventEmitter);

DirVisitor.prototype.reset = function(anotherDir, cb) {
	var self = this;
	fs.stat(anotherDir, function(err, stat) {
		if (err) {
			self.emit('error', err);
		}

		if (!stat.isDirectory()) {
			self.emit('error', anotherDir + " is not a valid path");
		}	

		self.dir = anotherDir;
		self.fileCount = 0;
		self.folderCount = 0;
		cb(self);
	});
};

DirVisitor.prototype.visit = function() {
	var self = this;
	_visitSync(this.dir, 
			function(fn, fs) {
				self.fileCount++;
				self.emit('visit-file', fn, fs);	
			}, 
			function(dn) {
				self.folderCount++;
				self.emit('visit-folder', dn);
			});
	this.emit('end', this.fileCount, this.folderCount);
};

function _visitSync(dir, fileCB, folderCB) {
	folderCB(dir);
	var files = fs.readdirSync(dir);
	files.forEach(function(f) { 
		var fileName = path.join(dir, f);
		var fileStat = fs.statSync(fileName);
		if (fileStat.isFile()) {
			fileCB(fileName, fileStat);
		} else if (fileStat.isDirectory()) {
			_visitSync(fileName, fileCB, folderCB);
		}
	});
}

exports.DirVisitor = DirVisitor;

// dir visitor end

