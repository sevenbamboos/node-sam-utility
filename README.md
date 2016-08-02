# Sam's utilities
## Maven cleaner
Usage:
```
var samUtility = require('sam-utility');
// target-folder, [test or delete], [file-size (1M by default)]
samUtility.DiskCleaner.cleanMaven(process.argv[2], process.argv[3], process.argv[4]);
```
