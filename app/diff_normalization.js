const fs = require('fs'),
      readline = require('readline');

// TODO extract application code into a new file
if (process.argv.length < 3) {
  console.error("Invalid params. Usage: node diff_normalization diff_file_1 diff_file_2 ...");
  return;
}

let normalize = function(file) {

  let getNewFileName = function(file) {
    const index = file.lastIndexOf('\.');
    return file.slice(0, index) + '_nor' + file.slice(index);
  };

  const ws = fs.createWriteStream(getNewFileName(file));

  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: ws
  });

  rl.on('line', line => {
    const notExisting = line.lastIndexOf('(nonexistent)');
    if (notExisting != -1) {
      line = line.replace(/\(nonexistent\)/, '(revision 0)');
    }
    ws.write(line + '\n');
  });

  rl.on('close', () => {
    ws.end();
  });

};

let files = process.argv.slice(2);
files.forEach(val => {
  normalize(val);
});

// TODO module.exports and exports?
exports.normalize = normalize;
