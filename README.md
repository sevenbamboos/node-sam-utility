# Sam's utilities

## HL7 parser

[![Build Status](https://travis-ci.org/sevenbamboos/node-sam-utility.svg?branch=master)](https://travis-ci.org/sevenbamboos/node-sam-utility)

Usage:
How to parse a HL7 message
```
var hl7 = require('sam-utility').hl7;
var objMsg = new hl7.Message(strMsg);
```

objMsg has a number of properties like:
* messageType
* triggerEvent
* version
* length (the number of segments)

It also has methods to find segments:
* findSegment(:segmentName)
* findAllSegments(:segmentName)
* filterSegment(:callback) (callback = function(currentSegment, currentIndex) => bool)

How to parse a segment
```
var segment = new hl7.Segment(str);
```

segment has the following properties:
* name
* length (the number of fields)

It also supports get and set methods:
* get([fieldIndex, [fieldEntryIndex, [componentIndex, [subComponentIndex]]]])
* set(newValue, [fieldIndex, [fieldEntryIndex, [componentIndex, [subComponentIndex]]]])

How to parse a field
```
var field = new hl7.Field(str);
```

field also supports get and set methods:
* get([fieldEntryIndex, [componentIndex, [subComponentIndex]]])
* set(newValue, [fieldEntryIndex, [componentIndex, [subComponentIndex]]])

How to parse a component
```
var component = new hl7.Component(str);
```

component also supports get and set methods:
* get([componentIndex, [subComponentIndex]])
* set(newValue, [componentIndex, [subComponentIndex]])

sub-component is plain string

Please refer to test/test_hl7.js for more details

## Maven cleaner
Usage:
```
var samUtility = require('sam-utility');
// target-folder, [test or delete], [file-size (1M by default)]
samUtility.DiskCleaner.cleanMaven(process.argv[2], process.argv[3], process.argv[4]);
```
