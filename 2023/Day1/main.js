const fs = require('fs');
const readline = require('readline');

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

const getFirstDigit = (line) => {
    const digits = getDigits(line);
    return digits.slice(0, 1);
};

const getLastDigit = (line) => {
    const digits = getDigits(line);
    return digits.slice(-1);
}

let total = 0;

rl.on('line', function(line) {
    //console.log(line);
    const firstDigit = getFirstDigit(line);
    const lastDigit = getLastDigit(line);

    const lineVal = Number(`${firstDigit}${lastDigit}`);
    console.log(`${lineVal} - ${line}`);

    total += lineVal;
});

rl.on('close', function() {
    console.log(`Total is: ${total}`);
});

