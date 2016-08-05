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

Message.prototype.find = function() {

};

Message.prototype.toString = function() {
	return this.segments.map(function(segment) {
		return segment.toString();
	}).join(constant.SEGMENT_SPLIT);
};

module.exports = Message;

