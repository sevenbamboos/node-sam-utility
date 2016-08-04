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
			assert.equal("^~\&", seg[1]);
			assert.equal("Sending test", seg[2]);
			assert.equal("Sending test facility", seg[3]);
		});

		it('should parse value with multiple fields', function() {
			var str = "PID|||||John Dow||64121968|M|||Every town, every street||(206)3345232||||||987654321";
			var seg = new parseHL7.Segment(str);
			assert.equal(19, seg.length);
			assert.equal("PID", seg.name);
			assert.equal("", seg[0]);
			assert.equal("", seg[1]);
			assert.equal("John Dow", seg[4]);
			assert.equal("64121968", seg[6]);
			assert.equal("M", seg[7]);
			assert.equal("", seg[17]);
			assert.equal("987654321", seg[18]);
		});

		it('should parse single value (MSH)', function() {
			var str = "MSH";
			var seg = new parseHL7.Segment(str);
			assert.equal(1, seg.length);
			assert.equal("|", seg[0]);
		});

		it('should parse single value', function() {
			var str = "PID";
			var seg = new parseHL7.Segment(str);
			assert.equal(0, seg.length);
			assert.equal("", seg.toString());
			assert.equal(undefined, seg[0]);
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
		});

		it('should parse single value', function() {
			var str = "1";
			var field = new parseHL7.Field(str);
			assert.equal(1, field.length);
			assert.equal("1", field[0]);
		});

		it('should parse empty value', function() {
			var str = "";
			var field = new parseHL7.Field(str);
			assert.equal(1, field.length);
			assert.equal("", field[0]);
		});

		it('should parse complex components', function() {
			var str = "a^b&c~2";
			var field = new parseHL7.Field(str);
			var field1 = field[0];
			var field2 = field[1];
			var comp11 = field1[0];
			var comp12 = field1[1];
			assert.equal("a", comp11.toString());
			assert.equal("b&c", comp12.toString());
			assert.equal("b", comp12[0]);
			assert.equal("c", comp12[1]);
			assert.equal("2", field2.toString());
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
		});

		it('should parse single value', function() {
			var str = "1";
			var comp = new parseHL7.Component(str);
			assert.equal(1, comp.length);
			assert.equal("1", comp[0]);
		});

		it('should parse empty value', function() {
			var str = "";
			var comp = new parseHL7.Component(str);
			assert.equal(1, comp.length);
			assert.equal("", comp[0]);
		});
	});
});

