const fs = require('fs');
const readline = require('readline');

exports.readfile = (fileName, onDone) => {
    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const lines = [];
    rl.on('line', (line) => {
        lines.push(line);
    });

    rl.on('close', function() {
        onDone(lines);
    });
};