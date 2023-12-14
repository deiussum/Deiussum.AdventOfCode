const fs = require('fs');
const readline = require('readline');
const stopwatch = require('../../common/node/stopwatch');

stopwatch.start();
const fileStream = fs.createReadStream('input.txt');
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

const replaceDigitWords = (line) => {
    // Instead of replacing the text with the number, replace it with the number padded inside first/last letter of the 
    // number word.  This will handle cases where you have things like oneight so that both numbers get inserted.
    const replacements = [
        { text: 'zero', replacement: 'z0o' },
        { text: 'one', replacement: 'o1e' },
        { text: 'two', replacement: 't2o' }, 
        { text: 'three', replacement: 't3e' },
        { text: 'four', replacement: 'f4r' },
        { text: 'five', replacement: 'f5e' },
        { text: 'six', replacement: 's6x' },
        { text: 'seven', replacement: 's7n' },
        { text: 'eight', replacement: 'e8t' },
        { text: 'nine', replacement: 'n9e' }
    ];

    let newLine = line;
    replacements.forEach((replacement) => {
        const regEx = new RegExp(replacement.text, 'g');
        newLine = newLine.replace(regEx, replacement.replacement)
    });

    return newLine;
}

const getDigits = (line) => {
    const newLine = replaceDigitWords(line);
    return newLine.replace(/\D/g,'');
}

let total = 0;
rl.on('line', function(line) {
    //stopwatch.timelog(line);
    const digits = getDigits(line);
    const firstDigit = digits.slice(0, 1);
    const lastDigit = digits.slice(-1);

    const lineVal = Number(`${firstDigit}${lastDigit}`);
    stopwatch.timelog(`${lineVal} - ${line}`);

    total += lineVal;
});

rl.on('close', function() {
    stopwatch.timelog(`Total is: ${total}`);
    stopwatch.stop();
});

