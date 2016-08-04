var SEGMENT_SPLIT 					= '\r',
		FIELD_SPLIT 						= '|',
		FIELD_REPETITIVE_SPLIT 	= '~',
		FIELD_SPLIT 						= '|',
		COMPONENT_SPLIT 				= '^',
		SUB_COMPONENT_SPLIT 		= '&',
		HEADER_NAME 						= 'MSH';

// segment index starting from 0
var Message = function(msg) {
	this.segments = [];
	msg.split(SEGMENT_SPLIT).forEach(function(seg) {
		if (seg) {
			this.segments.push(new Segment(seg.trim()));
		}
	}.bind(this));	
	assignPropertyWithArray(this, this.segments);
	this.length = this.segments.length;
};

Message.prototype.toString = function() {
	return this.segments.map(function(segment) {
		return segment.toString();
	}).join(SEGMENT_SPLIT);
};

// field index starting from 0
var Segment = function(seg) {
	if (!seg) {
		throw new Error("empty segment");
	}

	this.fields = [];
	seg.split(FIELD_SPLIT).forEach(function(fie) {
		this.fields.push(new Field(fie.trim()));
	}.bind(this));

	this.name = this.fields[0];

	// for MSH, msh.1 is |
	if (this.name == HEADER_NAME) {
		this.fields[0] = FIELD_SPLIT;
	} else { // for rest segments, segment name is excluded from fields
		this.fields.shift();
	}
	
	if (this.fields) {
		assignPropertyWithArray(this, this.fields);
	}
	this.length = this.fields.length;
};

Segment.prototype.toString = function() {
	return this.fields.map(function(field) {
		return field.toString();
	}).join(FIELD_SPLIT);
};

// repetitive field and component index starting from 0
var Field = function(fie) {
	this.values = [];

	var parseValue = function(val) {
		if ((val.indexOf(COMPONENT_SPLIT) !== -1) || 
				(val.indexOf(SUB_COMPONENT_SPLIT) !== -1)) {
			var comps = val.split(COMPONENT_SPLIT);
			var components = [];
			comps.forEach(function(comp) {
				components.push(new Component(comp.trim()));
			});
			return components;
		} else {
			return val;
		}
	};
	
	fie.split(FIELD_REPETITIVE_SPLIT).forEach(function(val) {
		this.values.push(parseValue(val));
	}.bind(this));

	assignPropertyWithArray(this, this.values);
	this.length = this.values.length;
};

Field.prototype.toString = function() {
	return this.values.map(function(v) {
		if (typeof v === 'string') {
			return v;
		} else {
			return v.map(function(comp) { 
				return comp.toString(); 
			}).join(COMPONENT_SPLIT);
		}
	}).join(FIELD_REPETITIVE_SPLIT);
};

// sub-component index starting from 0
var Component = function(comp) {
	if (comp.indexOf(SUB_COMPONENT_SPLIT) !== -1) {
		var subComps = comp.split(SUB_COMPONENT_SPLIT);
		var subComponents = [];
		subComps.forEach(function(subComp) {
			subComponents.push(subComp.trim());
		});
		this.value = subComponents;
		this.length = subComponents.length;
		assignPropertyWithArray(this, subComponents);

	} else {
		this.value = comp;
		this.length = 1;
		this[0] = comp;
	}
};

Component.prototype.toString = function() {
	if (typeof this.value === 'string') {
		return this.value;
	} else {
		return this.value.join(SUB_COMPONENT_SPLIT);
	}
};

var assignPropertyWithArray = function(obj, arr) {
	if (!arr) {
		obj[0] = '';
		return;
	}

	for (var i = 0; i < arr.length; i++) {
		obj[i] = arr[i];
	}
};

exports.Component = Component;
exports.Field = Field;
exports.Segment = Segment;
exports.Message = Message;
