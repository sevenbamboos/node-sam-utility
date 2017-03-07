const fs = require('fs'),
      readline = require('readline');

function insert(str, index, appendStr) {
  return str.slice(0, index) + appendStr + str.slice(index);
}

exports.insert = insert;

function normalize(file) {

  let getNewFileName = function(file) {
    const index = file.lastIndexOf('\.');
    return insert(file, index, '_diffn');
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

exports.normalize = normalize;