var assert = require('assert'),
		hl7 = require('../app/index').hl7;

describe('hl7', function() {

	describe("#Message(msg)", function() {

		var strMsg = "MSH|^~\&|Sending test|Sending test facility|Receiving test|Receiving test facility||SECURITY|ORU^R01|12345|P|2.5\r" + 
								 "PID|||||John Dow||64121968|M|||Every town, every street||(206)3345232||||||987654321\r" + 
								 "PV1||I|6402DH^^^^^^^^MED. 1 - ONCOLOGIA^^OSPEDALE MAGGIORE DI LODI&LODI|||^^^^^^^^^^OSPEDALE MAGGIORE DI LODI&LODI|13936^TEST^TEST||||||||||5068^TEST2^TEST2||2008003369||||||||||||||||||||||||||200803031508\r" + 
								 "ORC|NW|OP0911131G|OF0911131G||SC||^^^20130911120000^^R|||10006||DOKORC_12_0911131|||||DEPORC_17_0911131||||BDS Ordering hospital\r" + 
								 "NTE|||some text to be stored as order level attachment||code1\r" + 
							   "OBR|1|1^GHH OE_01&a|1045813^GHH LAB|15545^GLUCOSE||||||111~222||||||555-55-5555^PRIMARY^PATRICIA P^^^^MD|||||||||F|||||||444-44-4444^^^^^^MD\r" + 
							   "NTE|||some text to be stored as study level attachment||code2";

		it('should turn a string message into a message obj', function() {
			var msg = new hl7.Message(strMsg);
			assert.ok(msg !== null);
			//console.log(JSON.stringify(objMsg, null, 2));
			//console.log(objMsg.toString());
			assert.equal(7, msg.length);
			assert.equal("ORU", msg.messageType);
			assert.equal("R01", msg.triggerEvent);
			assert.equal("2.5", msg.version);
			assert.equal("MSH", msg.segments[0].name);
			assert.equal("PID", msg.segments[1].name);
			assert.equal("PV1", msg.segments[2].name);
			assert.equal("ORC", msg.segments[3].name);
			assert.equal("NTE", msg.segments[4].name);
			assert.equal("OBR", msg.segments[5].name);
			assert.equal("NTE", msg.segments[6].name);
		});

		it('should find the existing of a segment', function() {
			var msg = new hl7.Message(strMsg);
			var pid = msg.findSegment('pid');
			assert.equal("PID", pid.name);

			var notExisting = msg.findSegment('notexisting');
			assert.equal(null, notExisting);
		});

		it('should find multiple segments', function() {
			var msg = new hl7.Message(strMsg);
			var ntes = msg.findAllSegments('nte');
			assert.equal(2, ntes.length);
		});

		it('should filter a specific segment', function() {
			var msg = new hl7.Message(strMsg);
			var nte = msg.filterSegment(function(currSeg, currIndex) {
				return currSeg.name == 'NTE' && msg.segments[currIndex-1].name == 'OBR';
			});
			assert.equal('code2', nte.get(5));
		});

	});

	describe("#Segment(str)", function() {	
		it('should parse value with multiple fields (MSH)', function() {
			var str = "MSH|^~\&|Sending test|Sending test facility|Receiving test|Receiving test facility||SECURITY|ORU^R01|12345|P|2.5";
			var seg = new hl7.Segment(str);
			assert.equal(12, seg.length);
			assert.equal("MSH", seg.name);
			assert.equal("|", seg.get(1));
			assert.equal("^~\&", seg.get(2));
			assert.equal("Sending test", seg.get(3));
			assert.equal("Sending test facility", seg.get(4));
		});

		it('should parse value with multiple fields', function() {
			var str = "PID|||||John Dow||64121968|M|||Every town, every street^2&3~b||(206)3345232||||||987654321";
			var seg = new hl7.Segment(str);
			assert.equal(19, seg.length);
			assert.equal("PID", seg.name);
			assert.equal("", seg.get(1));
			assert.equal("", seg.get(2));
			assert.equal("John Dow", seg.get(5));
			assert.equal("64121968", seg.get(7));
			assert.equal("M", seg.get(8));
			assert.equal("", seg.get(18));
			assert.equal("987654321", seg.get(19));
			assert.equal("Every town, every street", seg.get(11, 0, 1));
			assert.equal("2", seg.get(11, 0, 2, 1));
			assert.equal("3", seg.get(11, 0, 2, 2));
			assert.equal("b", seg.get(11, 1));
		});

		it('should parse single value (MSH)', function() {
			var str = "MSH";
			var seg = new hl7.Segment(str);
			assert.equal(1, seg.length);
			assert.equal("|", seg.get(1));
			assert.equal("MSH", seg.get());
		});

		it('should parse single value', function() {
			var str = "PID";
			var seg = new hl7.Segment(str);
			assert.equal(0, seg.length);
			assert.equal("PID", seg.toString());
			assert.equal("PID", seg.get());
		});

		it.skip('should not parse empty value', function() {
			assert.throws(function() {new hl7.Segment("");}, Error);
		});

		it('should assign single value to segment as a whole', function() {
			var str = 'PID|field1|field2|';
			var seg = new hl7.Segment(str);
			seg.set('PID|xxx');
			assert.equal('PID|xxx', seg.get());
		});

		it('should assign value to field', function() {
			var str = 'PID|field1|field2|';
			var seg = new hl7.Segment(str);
			seg.set('new-field2', 2);
			assert.equal('PID|field1|new-field2', seg.get());
		});

		it('should assign value to field at extra place', function() {
			var str = 'PID|field1|field2|';
			var seg = new hl7.Segment(str);
			seg.set('new-field', 4);
			assert.equal('PID|field1|field2||new-field', seg.get());
		});

		it('should assign value to repetitive field', function() {
			var str = 'PID|field1|field2~field2b|';
			var seg = new hl7.Segment(str);
			seg.set('new-field', 2, 1);
			assert.equal('PID|field1|field2~new-field', seg.get());
		});

		it('should assign value to repetitive field at extra place', function() {
			var str = 'PID|field1|field2~field2b|';
			var seg = new hl7.Segment(str);
			seg.set('new-field', 2, 3);
			assert.equal('PID|field1|field2~field2b~~new-field', seg.get());
		});

		it('should assign value to component', function() {
			var str = 'PID|field1|field2^field2b|';
			var seg = new hl7.Segment(str);
			seg.set('new-field', 2, 0, 2);
			assert.equal('PID|field1|field2^new-field', seg.get());
		});

		it('should assign value to component at extra place', function() {
			var str = 'PID|field1|field2^field2b|';
			var seg = new hl7.Segment(str);
			seg.set('new-field', 2, 0, 2);
			assert.equal('PID|field1|field2^new-field', seg.get());
		});

		it('should assign value to sub-component', function() {
			var str = 'PID|field1|field2^field2b&field2c|';
			var seg = new hl7.Segment(str);
			seg.set('new-field', 2, 0, 2, 2);
			assert.equal('PID|field1|field2^field2b&new-field', seg.get());
		});

		it('should assign value to sub-component at extra place', function() {
			var str = 'PID|field1|field2^field2b&field2c|';
			var seg = new hl7.Segment(str);
			seg.set('new-field', 2, 0, 2, 4);
			assert.equal('PID|field1|field2^field2b&field2c&&new-field', seg.get());
		});

		it('should support appending value', function() {
			var seg = new hl7.Segment();
			seg.addField('field1');
			seg.addField('field2');
			console.log(seg);
		});
	});

	describe("#Field(str)", function() {	
		it('should parse repetitive values within one field', function() {
			var str = "1~2~3";
			var field = new hl7.Field(str);
			assert.equal(3, field.length);
			assert.equal("1", field.get(0));
			assert.equal("2", field.get(1));
			assert.equal("3", field.get(2));
			assert.throws(function() { field.get(-1); }, Error, "Index shouldn't be less than 0 (since it's 0 based)");
			assert.throws(function() { field.get(field.length); }, Error, "Index shouldn't be larger than the length");
		});

		it('should parse single value', function() {
			var str = "1";
			var field = new hl7.Field(str);
			assert.equal(1, field.length);
			assert.equal("1", field.get(0));
			assert.equal("1", field.get(), "By default, get didn't return the first entry");
		});

		it('should parse empty value', function() {
			var str = "";
			var field = new hl7.Field(str);
			assert.equal(1, field.length);
			assert.equal("", field.get(0));
			assert.equal("", field.get(), "By default, get didn't return the first entry");
		});

		it('should parse complex components', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			assert.equal("a", field.get(0, 1));
			assert.equal("b&c", field.get(0, 2));
			assert.throws(function() { field.get(0, 0); } , Error, "Invalid component index didn't throw error");
			assert.throws(function() { field.get(0, 3); } , Error, "Invalid component index didn't throw error");
			assert.equal("b", field.get(0, 2, 1));
			assert.equal("c", field.get(0, 2, 2));
			assert.equal("2", field.get(1));
		});

		it('should assign a single value', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			field.set("1234");
			assert.equal("1234", field.get());	
		});

		it('should assign value to repetitive fields', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			field.set("1234", 0);
			field.set("5678", 1);
			assert.equal("1234~5678", field.get());	
		});

		it('should assign value to repetitive fields at extra place', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			field.set("1234", 4);
			assert.equal("a^b&c~2~~~1234", field.get());	
		});

		it('should assign value to component', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			field.set("1234", 0, 1);
			field.set("5678", 0, 2);
			assert.equal("1234^5678", field.get(0));	
			assert.equal("2", field.get(1));	
			assert.equal("1234^5678~2", field.get());	
		});

		it('should assign value to component at extra place', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			field.set("1234", 0, 4);
			field.set("5678", 1, 3);
			assert.equal("a^b&c^^1234~2^^5678", field.get());	
		});

		it('should assign value to sub-component', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			field.set("1234", 0, 2, 2);
			assert.equal("a^b&1234", field.get(0));	
			assert.equal("2", field.get(1));	
			assert.equal("a^b&1234~2", field.get());	
		});

		it('should assign value to sub-component at extra place', function() {
			var str = "a^b&c~2";
			var field = new hl7.Field(str);
			field.set("1234", 0, 2, 4);
			assert.equal("a^b&c&&1234~2", field.get());	
		});
	});

	describe("#Component(str)", function() {	
		it('should parse value with multiple sub-components', function() {
			var str = "1&2&3";
			var comp = new hl7.Component(str);
			assert.equal(3, comp.length);
			assert.equal("1", comp.get(1));
			assert.equal("2", comp.get(2));
			assert.equal("3", comp.get(3));
			assert.throws(function() { comp.get(0); }, Error, "Index shouldn't be less than 1 (since it's 1 based)");
			assert.throws(function() { comp.get(comp.length+1); }, Error, "Index shouldn't be larger than the length");
		});

		it('should parse single value', function() {
			var str = "1";
			var comp = new hl7.Component(str);
			assert.equal(1, comp.length);
			assert.equal("1", comp.get(1));
			assert.equal("1", comp.get(), "single value shouldn't care about index");
		});

		it('should parse empty value', function() {
			var str = "";
			var comp = new hl7.Component(str);
			assert.equal(1, comp.length);
			assert.equal("", comp.get(1));
			assert.equal("", comp.get(), "single value shouldn't care about index");
		});

		it('should assign single value', function() {
			var str = "1&2&3";
			var comp = new hl7.Component(str);
			comp.set("a", 1);
			comp.set("b", 2);
			comp.set("c", 3);
			assert.equal("a&b&c", comp.get());
			assert.throws(function() { comp.set("d", 0); }, Error, "Index shouldn't be less than 1 (since it's 1 based)");
		});

		it('should assign value as a whole component', function() {
			var str = "1&2&3";
			var comp = new hl7.Component(str);
			comp.set("a&b&c");
			assert.equal("a&b&c", comp.get());
		});

		it('should assign value at extra place', function() {
			var str = "1&2&3";
			var comp = new hl7.Component(str);
			assert.equal(3, comp.length);
			comp.set("a", 4);
			comp.set("b", 6);
			assert.equal(6, comp.length);
			assert.equal("1&2&3&a&&b", comp.get());
		});

		it('should assign value at extra place for single value component', function() {
			var str = "123";
			var comp = new hl7.Component(str);
			assert.equal(1, comp.length);
			comp.set("a", 2);
			comp.set("b", 3);
			assert.equal(3, comp.length);
			assert.equal("123&a&b", comp.get());
		});

		//TODO assign component value with special encoding characters
	});
});

