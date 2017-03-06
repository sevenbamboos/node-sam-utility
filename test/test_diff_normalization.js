var assert = require('assert'),
		diffn = require('../app/index').diffn;

describe('diff_normalization', function() {

	describe("normalization", function() {
		it('correct incompatible words', function() {
			diffn.normalize('./diff_origin.txt');	
		});
	});
});

