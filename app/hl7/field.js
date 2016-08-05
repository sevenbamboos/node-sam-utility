var utility = require('../utility');
var constant = require('./constant');
var FieldEntry = require('./fieldEntry');

var Field = function(fie) {
	this.fields = [];
	fie.split(constant.FIELD_REPETITIVE_SPLIT).forEach(function(val) {
		this.fields.push(new FieldEntry(val));
	}.bind(this));

	this.length = this.fields.length;
};

Field.prototype.set = function(value, findex, cindex, scindex) {

	// replace the value of the whole field (inclduing all repetitive fields)
	if (utility.paramSize(arguments) === 1) {
		Field.call(this, value);
		return;

	} else if (utility.paramSize(arguments) > 1) {

		if (findex < 0) {
			throw new Error("Invalid index:" + findex + " for repetitive field, which should not be less than 0");
		}

		if (findex >= this.length) {
			this.extendRepetitiveField(findex);
		}
		this.fields[findex].set(value, cindex, scindex);
	}
};

Field.prototype.extendRepetitiveField = function(index) {
	if (index < this.fields.length) {
		throw new Error("Invalid index:" + index + " to extend repetitive fields:" + this.fields);
	}
	var i = this.fields.length;
	while (i++ <= index) {
		this.fields.push(new FieldEntry(''));
	}
	this.length = this.fields.length;
};

Field.prototype.get = function(findex, cindex, scindex) {
	if (findex === undefined && cindex === undefined && scindex === undefined) {
		return this.toString();
	} 

	if (findex !== undefined && (findex < 0 || findex >= this.fields.length)) {
		throw new Error("Invalid index:" + findex + " for repetitive field, which should be [0," + this.fields.length + ")");
	}
	return this.fields[findex].get(cindex, scindex);
};

Field.prototype.toString = function() {
	return this.fields.map(function(fieldEntry) {
		return FieldEntry.prototype.toString.call(fieldEntry);
	}).join(constant.FIELD_REPETITIVE_SPLIT);
};

module.exports = Field;

