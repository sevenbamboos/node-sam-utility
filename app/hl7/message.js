var constant = require('./constant');
var Segment = require('./segment');

var Message = function(msg) {
	this.segments = [];
	msg.split(constant.SEGMENT_SPLIT).forEach(function(seg) {
		if (seg) {
			this.segments.push(new Segment(seg.trim()));
		}
	}.bind(this));	
	this.length = this.segments.length;

	// find and process header
	var headers = this.segments.filter(function(segment) { return segment.name == constant.HEADER_NAME; });
	if (!headers) {
		throw new Error("Can't find header for HL7 message");
	}
	this.header = headers[0];
	this.messageType = this.header.get(9, 0, 1);
	this.triggerEvent = this.header.get(9, 0, 2);
	this.version = this.header.get(12);
};

Message.prototype.filterSegment = function(predict) {
	var findings = this.segments.filter(predict);
	if (findings) {
		return findings[0];
	} else {
		return null;
	}
};

Message.prototype.filterSegments = function(predict) {
	return this.segments.filter(predict);
};

Message.prototype.findSegment = function(segmentName) {
	var findings = this.findAllSegments(segmentName);	
	if (findings) {
		return findings[0];
	} else {
		return null;
	}
};

Message.prototype.findAllSegments = function(segmentName) {
	return this.segments.filter(function(seg) {
		return segmentName.toUpperCase() == seg.name;
	});	
};

Message.prototype.toString = function() {
	return this.segments.map(function(segment) {
		return segment.toString();
	}).join(constant.SEGMENT_SPLIT);
};

module.exports = Message;

