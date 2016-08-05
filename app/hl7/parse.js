var utility = require('../utility');

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

	var str = this.name + FIELD_SPLIT + this.fields.map(function(field) {
		return field.toString();
	}).join(FIELD_SPLIT);
	return removeFieldSplitAtEnd(str);
};

var removeFieldSplitAtEnd = function(str) {
	var arr = str.match(/^(.*?)\|+$/);
	if (arr && arr.length > 1) {
		return arr[1];
	}
	return str;
};

// repetitive field and component index starting from 0
var Field = function(fie) {
	this.fields = [];
	fie.split(FIELD_REPETITIVE_SPLIT).forEach(function(val) {
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
	}).join(FIELD_REPETITIVE_SPLIT);
};

var FieldEntry = function(val) {
	this.components = [];
	this.value = undefined;
	if ((val.indexOf(COMPONENT_SPLIT) !== -1) || 
			(val.indexOf(SUB_COMPONENT_SPLIT) !== -1)) {
		var comps = val.split(COMPONENT_SPLIT);
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
		}).join(COMPONENT_SPLIT);
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
		return this.value.join(SUB_COMPONENT_SPLIT);
	}
};

Component.prototype.isSingleValue = function() {
	return typeof this.value === 'string';
};

exports.Component = Component;
exports.Field = Field;
exports.FieldEntry = FieldEntry;
exports.Segment = Segment;
exports.Message = Message;
