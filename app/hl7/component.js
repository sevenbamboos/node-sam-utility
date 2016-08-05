var constant = require('./constant');

var Component = function(comp) {
	if (comp.indexOf(constant.SUB_COMPONENT_SPLIT) !== -1) {
		var subComps = comp.split(constant.SUB_COMPONENT_SPLIT);
		var subComponents = [];
		subComps.forEach(function(subComp) {
			subComponents.push(subComp.trim());
		});
		this.value = subComponents;
		this.length = subComponents.length;

	} else {
		this.value = comp;
		this.length = 1;
	}
};

Component.prototype.set = function(value, i) {
	
	// replace the value of the whole component
	if (i === undefined) {
		Component.call(this, value);

	// set an individual sub-component
	} else {

		if (i < 1) {
			throw new Error("Invalid index:" + i + ", which should not be less than 1");

		} else {

			// transfer string to sub-component array
			if (this.isSingleValue()) {
				var originValue = this.value;
				this.value = [];
				this.value.push(originValue);
			}

			if (i > this.length) {
				this.extendSubComponent(i);
			} 

			//TODO encode the possible split characters?
			this.value[i-1] = value;
		}
	}
};

Component.prototype.extendSubComponent = function(index) {
	if (index < this.value.length) {
		throw new Error("Invalid index:" + index + " to extend sub-component:" + this.value);
	}
	var i = this.value.length;
	while (i++ < index) {
		this.value.push('');
	}
	this.length = this.value.length;
};

Component.prototype.get = function(i) {
	if (this.isSingleValue()) {
		return this.value;
	} else {
		if (i === undefined) {
			return this.toString();
		} else if (i < 1 || i > this.length) {
			throw new Error("Invalid index:" + i + ", which should be [1," + this.length + "]");
		} else {
			return this.value[i-1];
		}
	}
};

Component.prototype.toString = function() {
	if (this.isSingleValue()) {
		return this.value;
	} else {
		return this.value.join(constant.SUB_COMPONENT_SPLIT);
	}
};

Component.prototype.isSingleValue = function() {
	return typeof this.value === 'string';
};

module.exports = Component;

