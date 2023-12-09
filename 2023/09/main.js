const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');
    const startTime = new Date();

    const sequences = [];
    let part1Total = 0;
    lines.forEach((line) => {
        const sequence = new Sequence(line);
        sequences.push(sequence);
        const nextSequence = sequence.getNextValue();
        part1Total += nextSequence;

        console.log(`${line} => ${nextSequence}`);
    });

    console.log(`Part 1 total is ${part1Total}`);

    const endTime = new Date();
    const elapsed = endTime - startTime;
    console.log(`Completed in ${elapsed}ms`);
});



class Sequence
{
    #numbers = [];

    constructor(line) {
        const splits = line.split(' ');

        splits.forEach(split => {
            this.#numbers.push(Number(split));
        });
    }

    getNextValue() {
        const sequences = [];

        let sequence = this.#numbers;
        while(!this.#areAllZero(sequence)) {
            sequences.push(sequence);
            sequence = this.#getNextSequence(sequence);
        }

        let nextValue = 0;

        for (let i = sequences.length - 1; i >= 0; i--)  {
            const currentSequence = sequences[i];
            const lastNumber = currentSequence[currentSequence.length - 1];

            nextValue += lastNumber;
        }

        return nextValue;
    }

    #getNextSequence(numbers) {
        const sequence = [];

        for(let i = 0; i < numbers.length - 1; i++) {
            sequence.push(numbers[i+1] - numbers[i]);
        }

        return sequence;
    }

    #areAllZero(numbers) {
        for(let i = 0; i < numbers.length; i++) {
            if (numbers[i] !== 0) return false;
        }

        return true;
    }
}