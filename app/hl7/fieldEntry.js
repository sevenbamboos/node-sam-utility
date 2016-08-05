var utility = require('../utility');
var constant = require('./constant');
var Component = require('./component');

var FieldEntry = function(val) {
	this.components = [];
	this.value = undefined;
	if ((val.indexOf(constant.COMPONENT_SPLIT) !== -1) || 
			(val.indexOf(constant.SUB_COMPONENT_SPLIT) !== -1)) {
		var comps = val.split(constant.COMPONENT_SPLIT);
		comps.forEach(function(comp) {
			this.components.push(new Component(comp.trim()));
		}.bind(this));
		return;
	} else {
		this.value = val;
	}
};

FieldEntry.prototype.toString = function() {
	if (this.value) {
		return this.value;
	} else {
		return this.components.map(function(comp) { 
			return comp.toString(); 
		}).join(constant.COMPONENT_SPLIT);
	}
};

FieldEntry.prototype.set = function(value, cindex, scindex) {

	// replace the value of the whole field
	if (utility.paramSize(arguments) === 1) {
		FieldEntry.call(this, value);
		return;

	} else if (utility.paramSize(arguments) > 1) {
		
		if (cindex < 1) {
			throw new Error("Invalid index:" + cindex + " for component, which should not be less than 1");
		}

		// clear value and move it to the first component
		if (this.value) {
			this.components[0] = this.value;
			this.value = undefined;
		}

		if (cindex > this.components.length) {
			this.extendComponent(cindex);	
		}

		var comp = this.components[cindex-1];
		// set component (or sub-component) value
		comp.set(value, scindex);
	}
};

FieldEntry.prototype.extendComponent = function(index) {
	if (index < this.components.length) {
		throw new Error("Invalid index:" + index + " to extend component:" + this.toString());
	}
	var i = this.components.length;
	while (i++ < index) {
		this.components.push(new Component(''));
	}
};

FieldEntry.prototype.get = function(cindex, scindex) {
	if (cindex === undefined && scindex === undefined) {
		return this.toString();
	} 

	var comp = this.components[cindex-1];
	if (comp === undefined) {
		throw new Error("Invalid index:" + cindex + " for component:" + this.components);
	}
	return comp.get(scindex);
};

module.exports = FieldEntry;

