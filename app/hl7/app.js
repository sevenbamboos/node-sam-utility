var parseHL7 = require('./parse');

var str = "a^b&c~2";
var field = new parseHL7.Field(str);
var comp1 = field[1][0];
var comp2 = field[1][1];
console.log(comp1.toString());
console.log(comp2.toString());

