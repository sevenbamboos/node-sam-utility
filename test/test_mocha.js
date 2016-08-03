var assert = require('assert'),
		should = require('should'),
		utility = require('../app/utility');

describe('utility', function() {

	before(function() {
		//
	});

	beforeEach(function() {
		//
	});

	describe("#fileSizeInK()", function() {
		it('should return file size in kelobytes', function() {
			// assert
			assert.equal("1.000K", utility.fileSizeInK(1024));
		});
	});

	describe("#fileSizeInM()", function() {
		it('should return file size in megabytes', function() {
			// should
			utility.fileSizeInM(1024*1024).should.equal("1.000M");
		});
	});

	afterEach(function() {
		//
	});

	after(function() {
		//
	});

});
