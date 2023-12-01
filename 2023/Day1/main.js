const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('input.txt');
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

const replaceDigitWords = (line) => {
    const replacements = [
        { value: 0, text: 'zero' },
        { value: 1, text: 'one' },
        { value: 2, text: 'two' }, 
        { value: 3, text: 'three' },
        { value: 4, text: 'four' },
        { value: 5, text: 'five' },
        { value: 6, text: 'six' },
        { value: 7, text: 'seven' },
        { value: 8, text: 'eight' },
        { value: 9, text: 'nine' }
    ];

    let replacementsFound = [];
    replacements.forEach((replacement) => {
        let keepLooking = true;

        let nextIndex = 0;
        while(keepLooking) {
            const index = line.indexOf(replacement.text, nextIndex);

            if (index >=0) {
                replacementsFound.push({ ...replacement, index: index });
                nextIndex = index + 1;
            }
            else {
                keepLooking = false;
            }
        }
    });

    let firstReplacement = null;
    let lastReplacement = null;

    replacementsFound.forEach((replacement) => {
        if (!firstReplacement || replacement.index < firstReplacement.index) firstReplacement = replacement;
        if (!lastReplacement || replacement.index > lastReplacement.index) lastReplacement = replacement;
    });

    let newLine = line;
    if (lastReplacement) {
        newLine = newLine.slice(0, lastReplacement.index) 
            + lastReplacement.value 
            + newLine.slice(lastReplacement.index);
    }

    if (firstReplacement) {
        newLine = newLine.slice(0, firstReplacement.index) 
            + firstReplacement.value 
            + newLine.slice(firstReplacement.index);
    }

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

