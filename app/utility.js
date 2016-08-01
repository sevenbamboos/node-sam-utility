var fs = require('fs'),
		path = require('path'),
		util = require('util'),
		events = require('events');

exports.fileSizeInM = function(size) {
	return (size/1024/1024).toFixed(2) + "M";
};

exports.fileSizeInK = function(size) {
	return (size/1024).toFixed(2) + "K";
};

function DirVisitor(dir) {
	this.reset(dir);
	events.EventEmitter.call(this);
}

util.inherits(DirVisitor, events.EventEmitter);

DirVisitor.prototype.reset = function(anotherDir) {
	this.dir = anotherDir;
	this.fileCount = 0;
	this.folderCount = 0;
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
