var assert = require('assert'),
		parseHL7 = require('../app/hl7/parse');

describe('parseHL7', function() {

	describe("#Message(msg)", function() {

		var strMsg = "MSH|^~\&|Sending test|Sending test facility|Receiving test|Receiving test facility||SECURITY|ORU^R01|12345|P|2.5\r" + 
								 "PID|||||John Dow||64121968|M|||Every town, every street||(206)3345232||||||987654321\r" + 
								 "PV1||I|6402DH^^^^^^^^MED. 1 - ONCOLOGIA^^OSPEDALE MAGGIORE DI LODI&LODI|||^^^^^^^^^^OSPEDALE MAGGIORE DI LODI&LODI|13936^TEST^TEST||||||||||5068^TEST2^TEST2||2008003369||||||||||||||||||||||||||200803031508\r" + 
								 "ORC|NW|OP0911131G|OF0911131G||SC||^^^20130911120000^^R|||10006||DOKORC_12_0911131|||||DEPORC_17_0911131||||BDS Ordering hospital\r" + 
								 "NTE|||some text to be stored as order level attachment||code1\r" + 
							   "OBR|1|1^GHH OE_01&a|1045813^GHH LAB|15545^GLUCOSE||||||111~222||||||555-55-5555^PRIMARY^PATRICIA P^^^^MD|||||||||F|||||||444-44-4444^^^^^^MD\r" + 
							   "NTE|||some text to be stored as study level attachment||code2";

		it('should turn a string message into a message obj', function() {
			var msg = new parseHL7.Message(strMsg);
			assert.ok(msg !== null);
			//console.log(JSON.stringify(objMsg, null, 2));
			//console.log(objMsg.toString());
			assert.equal(7, msg.length);
			assert.equal("ORU", msg.messageType);
			assert.equal("R01", msg.triggerEvent);
			assert.equal("2.5", msg.version);
			assert.equal("MSH", msg[0].name);
			assert.equal("PID", msg[1].name);
			assert.equal("PV1", msg[2].name);
			assert.equal("ORC", msg[3].name);
			assert.equal("NTE", msg[4].name);
			assert.equal("OBR", msg[5].name);
			assert.equal("NTE", msg[6].name);
		});
	});

	describe("#Segment(str)", function() {	
		it('should parse value with multiple fields (MSH)', function() {
			var str = "MSH|^~\&|Sending test|Sending test facility|Receiving test|Receiving test facility||SECURITY|ORU^R01|12345|P|2.5";
			var seg = new parseHL7.Segment(str);
			assert.equal(12, seg.length);
			assert.equal("MSH", seg.name);
			assert.equal("|", seg[0]);
			assert.equal("|", seg.get(1));
			assert.equal("^~\&", seg[1]);
			assert.equal("^~\&", seg.get(2));
			assert.equal("Sending test", seg[2]);
			assert.equal("Sending test", seg.get(3));
			assert.equal("Sending test facility", seg[3]);
			assert.equal("Sending test facility", seg.get(4));
		});

		it('should parse value with multiple fields', function() {
			var str = "PID|||||John Dow||64121968|M|||Every town, every street^2&3~b||(206)3345232||||||987654321";
			var seg = new parseHL7.Segment(str);
			assert.equal(19, seg.length);
			assert.equal("PID", seg.name);
			assert.equal("", seg[0]);
			assert.equal("", seg.get(1));
			assert.equal("", seg[1]);
			assert.equal("", seg.get(2));
			assert.equal("John Dow", seg[4]);
			assert.equal("John Dow", seg.get(5));
			assert.equal("64121968", seg[6]);
			assert.equal("64121968", seg.get(7));
			assert.equal("M", seg[7]);
			assert.equal("M", seg.get(8));
			assert.equal("", seg[17]);
			assert.equal("", seg.get(18));
			assert.equal("987654321", seg[18]);
			assert.equal("987654321", seg.get(19));
			assert.equal("Every town, every street", seg.get(11, 0, 1));
			assert.equal("2", seg.get(11, 0, 2, 1));
			assert.equal("3", seg.get(11, 0, 2, 2));
			assert.equal("b", seg.get(11, 1));
		});

		it('should parse single value (MSH)', function() {
			var str = "MSH";
			var seg = new parseHL7.Segment(str);
			assert.equal(1, seg.length);
			assert.equal("|", seg[0]);
			assert.equal("|", seg.get(1));
			assert.equal("|", seg.get());
		});

		it('should parse single value', function() {
			var str = "PID";
			var seg = new parseHL7.Segment(str);
			assert.equal(0, seg.length);
			assert.equal("", seg.toString());
			assert.equal(undefined, seg[0]);
			assert.equal("", seg.get());
		});

		it('should not parse empty value', function() {
			assert.throws(function() {new parseHL7.Segment("");}, Error);
		});
	});

	describe("#Field(str)", function() {	
		it('should parse repetitive values within one field', function() {
			var str = "1~2~3";
			var field = new parseHL7.Field(str);
			assert.equal(3, field.length);
			assert.equal("1", field[0]);
			assert.equal("2", field[1]);
			assert.equal("3", field[2]);
			assert.equal("1", field.get(0));
			assert.equal("2", field.get(1));
			assert.equal("3", field.get(2));
			assert.throws(function() { field.get(-1); }, Error, "Index shouldn't be less than 0 (since it's 0 based)");
			assert.throws(function() { field.get(field.length); }, Error, "Index shouldn't be larger than the length");
		});

		it('should parse single value', function() {
			var str = "1";
			var field = new parseHL7.Field(str);
			assert.equal(1, field.length);
			assert.equal("1", field[0]);
			assert.equal("1", field.get(0));
			assert.equal("1", field.get(), "By default, get didn't return the first entry");
		});

		it('should parse empty value', function() {
			var str = "";
			var field = new parseHL7.Field(str);
			assert.equal(1, field.length);
			assert.equal("", field[0]);
			assert.equal("", field.get(0));
			assert.equal("", field.get(), "By default, get didn't return the first entry");
		});

		it('should parse complex components', function() {
			var str = "a^b&c~2";
			var field = new parseHL7.Field(str);
			var field1 = field[0];
			var field2 = field[1];
			var comp11 = field1[0];
			var comp12 = field1[1];
			assert.equal("a", comp11.toString());
			assert.equal("a", field.get(0, 1));
			assert.equal("b&c", comp12.toString());
			assert.equal("b&c", field.get(0, 2));
			assert.throws(function() { field.get(0, 0); } , Error, "Invalid component index didn't throw error");
			assert.throws(function() { field.get(0, 3); } , Error, "Invalid component index didn't throw error");
			assert.equal("b", comp12[0]);
			assert.equal("b", field.get(0, 2, 1));
			assert.equal("c", comp12[1]);
			assert.equal("c", field.get(0, 2, 2));
			assert.equal("2", field2.toString());
			assert.equal("2", field.get(1));
		});
	});

	describe("#Component(str)", function() {	
		it('should parse value with multiple sub-components', function() {
			var str = "1&2&3";
			var comp = new parseHL7.Component(str);
			assert.equal(3, comp.length);
			assert.equal("1", comp[0]);
			assert.equal("2", comp[1]);
			assert.equal("3", comp[2]);
			assert.equal("1", comp.get(1));
			assert.equal("2", comp.get(2));
			assert.equal("3", comp.get(3));
			assert.throws(function() { comp.get(0); }, Error, "Index shouldn't be less than 1 (since it's 1 based)");
			assert.throws(function() { comp.get(comp.length+1); }, Error, "Index shouldn't be larger than the length");
		});

		it('should parse single value', function() {
			var str = "1";
			var comp = new parseHL7.Component(str);
			assert.equal(1, comp.length);
			assert.equal("1", comp[0]);
			assert.equal("1", comp.get(1));
			assert.equal("1", comp.get(), "single value shouldn't care about index");
		});

		it('should parse empty value', function() {
			var str = "";
			var comp = new parseHL7.Component(str);
			assert.equal(1, comp.length);
			assert.equal("", comp[0]);
			assert.equal("", comp.get(1));
			assert.equal("", comp.get(), "single value shouldn't care about index");
		});
	});
});

