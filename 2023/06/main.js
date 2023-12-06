const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    const times = [];
    const distances = [];
    let part2Time = 0;
    let part2Distance = 0;
    
    lines.forEach((line) => {
        const labelSplit = line.split(':');
        if (labelSplit.length !== 2) return;

        const label = labelSplit[0];
        const numbers = parseNumbersToList(labelSplit[1]);

        if (label === "Time") {
            times.push(...numbers);
            part2Time = parseStringToNumber(labelSplit[1]);
        } 
        if (label === "Distance") { 
            distances.push(...numbers); 
            part2Distance = parseStringToNumber(labelSplit[1]);
        }
    });

    let part1Total = 1;
    for(let i = 0; i < times.length; i++) {
        const time = times[i];
        const distance = distances[i];
        const waysToWin = getWaysToWin(time, distance);

        part1Total *= waysToWin;
    }

    console.log(`Part 1 1otal is ${part1Total}`)

    const part2WaysToWin = getWaysToWin(part2Time, part2Distance);
    console.log(`Part 2 ways to win is ${part2WaysToWin}`);
});

const parseNumbersToList = (numberString) => {
    const numbers = [];

    const numberSplit = numberString.trim().split(' ');

    numberSplit.forEach((number) => {
        if (number === '') return;
        numbers.push(Number(number));
    });

    return numbers;
}

const parseStringToNumber = (numberString) =>  {
    const regex = / */g;
    const strippedNumberString = numberString.replace(regex, '');
    return Number(strippedNumberString);
}

const getWaysToWin = (time, distance) => {
    let num1 = 1;
    while(num1 * (time - num1) <= distance) num1++;
    const num2 = time - num1;
    const waysToWin = Math.abs(num2 - num1 + 1);

    console.log(`Time: ${time}, Distance: ${distance}, Num1: ${num1}, Num2: ${num2}, Ways to win: ${waysToWin}`);
    return waysToWin;
}
