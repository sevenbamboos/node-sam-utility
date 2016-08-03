var SEGMENT_SPLIT 					= '\r',
		FIELD_SPLIT 						= '|',
		FIELD_REPETITIVE_SPLIT 	= '~',
		FIELD_SPLIT 						= '|',
		COMPONENT_SPLIT 				= '^',
		SUB_COMPONENT_SPLIT 		= '&';

var Message = function(msg) {
	var segs = msg.split(SEGMENT_SPLIT);

	this.segments = [];
	var self = this;
	segs.forEach(function(seg) {
		self.segments.push(new Segment(seg));
	});	
};

Message.prototype.toString = function() {
	var s = "Message\r\n";
	this.segments.forEach(function(segment) {
		s += "\t" + segment.toString() + "\r\n";
	});
	return s;
};

var Segment = function(seg) {
	var fies = seg.split(FIELD_SPLIT);
	this.fields = [];

	var self = this;
	fies.forEach(function(fie) {
		self.fields.push(new Field(fie));
	});
};

Segment.prototype.toString = function() {
	var s = "Segment\r\n";
	this.fields.forEach(function(field) {
		s += "\t\t" + field.toString() + "\r\n";
	});
	return s;
};

var Field = function(fie) {
	var vals = fie.split(FIELD_REPETITIVE_SPLIT);
	this.length = vals.length;
	this.values = [];

	var parseValue = function(val) {
		if ((val.indexOf(COMPONENT_SPLIT) !== -1) || 
				(val.indexOf(SUB_COMPONENT_SPLIT) !== -1)) {
			//TODO
			return val;
		} else {
			return val;
		}
	};
	
	var self = this;
	vals.forEach(function(val) {
		self.values.push(parseValue(val));
	});
};

Field.prototype.toString = function() {
	var s = "Field\r\n";
	this.values.forEach(function(value) {
		s += "\t\t\t" + value + "\r\n";
	});
	return s;
};

exports.Field = Field;
exports.Segment = Segment;
exports.Message = Message;
