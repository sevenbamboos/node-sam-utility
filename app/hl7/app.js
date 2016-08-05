var parseHL7 = require('./parse');
var str = 'PID|field1|field2|';
var seg = new parseHL7.Segment(str);
seg.set('new-field2', 2);
console.log(seg.get());

