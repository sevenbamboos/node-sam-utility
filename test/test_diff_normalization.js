const assert = require('assert'),
			fs = require('fs'),
			diffn = require('../app/index').diffn,
			outputFile = './test/diff_origin_diffn.txt';

describe('diff_normalization', function() {

	before(function() {
		// clear output
		try {
			fs.unlinkSync(outputFile);
		} catch (e) {
			console.log(e);
			return;
		}
	});

	describe("", function() {
		it("should append a suffix to the existing file name", function() {
			const result = diffn.insert('test/some.diff', 9, '_diffn');
			assert.equal('test/some_diffn.diff', result);
		});
	});

	describe("normalization", function() {
		it('should correct incompatible words', function() {
			diffn.normalize('./test/diff_origin.txt');	
			fs.accessSync(outputFile, fs.constants.F_OK);
			assert.ok(true);
		});
	});
});

