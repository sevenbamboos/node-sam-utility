const diffn = require('../app/index.js').diffn;

// TODO extract application code into a new file
if (process.argv.length < 3) {
  console.error("Invalid params. Usage: node diff_normalization diff_file_1 diff_file_2 ...");
  return;
}

let files = process.argv.slice(2);
files.forEach(val => {
  diffn.normalize(val);
});
