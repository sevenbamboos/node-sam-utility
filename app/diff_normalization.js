const fs = require('fs'),
      readline = require('readline');

if (process.argv.length < 3) {
  console.error("Invalid params. Usage: node diff_normalization diff_file_1 diff_file_2 ...");
  return;
}

let getNewFileName = function(file) {
  const index = file.lastIndexOf('\.');
  return file.slice(0, index) + '_nor' + file.slice(index);
};

let normalize = function(file) {
  const rl = readline.createInterface({
    input: fs.createReadStream(file)
  });

  const ws = fs.createWriteStream(getNewFileName(file));

  // TODO pipeline?
  rl.on('line', line => {
    const notExisting = line.lastIndexOf('(nonexistent)');
    if (notExisting != -1) {
      line = line.replace(/\(nonexistent\)/, '(revision 0)');
    }
    ws.write(line + '\n');
  });

  // TODO no need to close writer?
  //ws.end();
};

let files = process.argv.slice(2);
files.forEach(val => {
  normalize(val);
});
