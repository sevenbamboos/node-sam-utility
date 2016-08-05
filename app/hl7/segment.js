var utility = require('../utility');
var constant = require('./constant');
var Field = require('./field');

var Segment = function(seg) {
	if (!seg) {
		throw new Error("empty segment");
	}

	this.fields = [];
	seg.split(constant.FIELD_SPLIT).forEach(function(fie) {
		this.fields.push(new Field(fie.trim()));
	}.bind(this));

	this.name = this.fields[0].toString().toUpperCase();

	// for MSH, msh.1 is |
	if (this.name == constant.HEADER_NAME) {
		this.fields[0] = constant.FIELD_SPLIT;
	} else { // for rest segments, segment name is excluded from fields
		this.fields.shift();
	}
	
	this.length = this.fields.length;
};

Segment.prototype.set = function(value, findex, frindex, cindex, scindex) {
	if (utility.paramSize(arguments) === 1) {
		Segment.call(this, value);
		return;
	}
	
	if (findex < 1) {
		throw new Error("Invalid field index:" + findex + " for segment, which should not be less than 1");
	}

	if (findex > this.length) {
		this.extendField(findex);
	}

	var field = this.fields[findex-1];
	field.set(value, frindex, cindex, scindex);	
};

Segment.prototype.extendField = function(index) {
	if (index < this.fields.length) {
		throw new Error("Invalid index:" + index + " to extend fields:" + this.fields);
	}
	var i = this.fields.length;
	while (i++ < index) {
		this.fields.push(new Field(''));
	}
	this.length = this.fields.length;
};

Segment.prototype.get = function(findex, frindex, cindex, scindex) {
	if (utility.paramSize(arguments) === 0) {
		return this.toString();
	}
	var field = this.fields[findex-1];
	if (field === undefined) {
		throw new Error("Invalid field index:" + findex + " for segment:" + this.toString());
	} else if (typeof field === "string") {
		return field;
	} else {
		return field.get(frindex, cindex, scindex);
	}
};

Segment.prototype.toString = function() {
	if (!this.fields) {
		return this.name;
	}

	var str = this.name + constant.FIELD_SPLIT + this.fields.map(function(field) {
		return field.toString();
	}).join(constant.FIELD_SPLIT);
	return removeFieldSplitAtEnd(str);
};

var removeFieldSplitAtEnd = function(str) {
	var arr = str.match(/^(.*?)\|+$/);
	if (arr && arr.length > 1) {
		return arr[1];
	}
	return str;
};

module.exports = Segment;

