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
	this.length = this.segments.length;

	// find and process header
	var headers = this.segments.filter(function(segment) { return segment.name == HEADER_NAME; });
	if (!headers) {
		throw new Error("Can't find header for HL7 message");
	}
	this.header = headers[0];
	this.messageType = this.header.get(9, 0, 1);
	this.triggerEvent = this.header.get(9, 0, 2);
	this.version = this.header.get(12);
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
	
	this.length = this.fields.length;
};

Segment.prototype.get = function(findex, frindex, cindex, scindex) {
	if (arguments.length === 0) {
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
	return this.fields.map(function(field) {
		return field.toString();
	}).join(FIELD_SPLIT);
};

// repetitive field and component index starting from 0
var Field = function(fie) {
	this.fields = [];

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
		this.fields.push(parseValue(val));
	}.bind(this));

	this.length = this.fields.length;
};

Field.prototype.set = function(value, findex, cindex, scindex) {
	if (arguments.length === 1) {
		//TODO continue here
	}
};

Field.prototype.get = function(findex, cindex, scindex) {
	if (findex === undefined && cindex === undefined && scindex === undefined) {
		return this.toString();
	} 

	var entry = this.fields[findex];
	if (cindex === undefined && scindex === undefined) {
		return getFieldValue(entry);	
	} else {
		var comp = entry[cindex-1];
		if (comp === undefined) {
			throw new Error("Invalid index:" + cindex + " for component:" + getFieldValue(entry));
		}
		return comp.get(scindex);
	}

};

Field.prototype.toString = function() {
	return this.fields.map(getFieldValue).join(FIELD_REPETITIVE_SPLIT);
};

var getFieldValue = function(fieldEntry) {
	if (typeof fieldEntry === 'string') {
		return fieldEntry;
	} else {
		return fieldEntry.map(function(comp) { 
			return comp.toString(); 
		}).join(COMPONENT_SPLIT);
	}
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

	} else {
		this.value = comp;
		this.length = 1;
	}
};

Component.prototype.set = function(value, i) {
	if (this.isSingleValue() || arguments.length === 1) {
		Component.call(this, value);
	} else {
		if (i < 1 || i > this.length) {
			throw new Error("Invalid index:" + i + ", which should be [1," + this.length + "]");
		} else {
			//TODO encode the possible split characters?
			this.value[i-1] = value;
		}
	}
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
		return this.value.join(SUB_COMPONENT_SPLIT);
	}
};

Component.prototype.isSingleValue = function() {
	return typeof this.value === 'string';
};

exports.Component = Component;
exports.Field = Field;
exports.Segment = Segment;
exports.Message = Message;