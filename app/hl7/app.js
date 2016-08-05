var parseHL7 = require('./parse');
			var str = "a^b&c~2";
			var field = new parseHL7.Field(str);
			field.set("1234", 4);
			console.log(field.get());
			//assert.equal("a^b&c~2~~~1234", field.get());	


