var parseHL7 = require('./parse');

var strMsg = "MSH|^~\&|Sending test|Sending test facility|Receiving test|Receiving test facility||SECURITY|ORU^R01|12345|P|2.5\r PID|||||John Dow||64121968|M|||Every town, every street||(206)3345232||||||987654321\r PV1||I|6402DH^^^^^^^^MED. 1 - ONCOLOGIA^^OSPEDALE MAGGIORE DI LODI&LODI|||^^^^^^^^^^OSPEDALE MAGGIORE DI LODI&LODI|13936^TEST^TEST||||||||||5068^TEST2^TEST2||2008003369||||||||||||||||||||||||||200803031508\r ORC|NW|OP0911131G|OF0911131G||SC||^^^20130911120000^^R|||10006||DOKORC_12_0911131|||||DEPORC_17_0911131||||BDS Ordering hospital\r NTE|||some text to be stored as order level attachment||code1\r OBR|1|1^GHH OE_01&a|1045813^GHH LAB|15545^GLUCOSE||||||111~222||||||555-55-5555^PRIMARY^PATRICIA P^^^^MD|||||||||F|||||||444-44-4444^^^^^^MD\r NTE|||some text to be stored as study level attachment||code2\r";

var objMsg = new parseHL7.Message(strMsg);
console.log(objMsg.toString());

