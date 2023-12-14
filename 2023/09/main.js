const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) stopwatch.timelog('No input to process');

    stopwatch.start();

    const sequences = [];
    let part1Total = 0;
    let part2Total = 0;
    lines.forEach((line) => {
        const sequence = new Sequence(line);
        sequences.push(sequence);
        const nextSequence = sequence.getNextValue();
        part1Total += nextSequence;

        const prevSequence = sequence.getPrevValue();
        part2Total += prevSequence

        stopwatch.timelog(`${prevSequence} <= ${line} => ${nextSequence}`);
    });

    stopwatch.timelog(`Part 1 total is ${part1Total}`);
    stopwatch.timelog(`Part 2 total is ${part2Total}`);

    stopwatch.stop();
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

    getPrevValue() {
        const sequences = [];

        let sequence = this.#numbers;
        while(!this.#areAllZero(sequence)) {
            sequences.push(sequence);
            sequence = this.#getNextSequence(sequence);
        }

        let prevValue = 0;

        for (let i = sequences.length - 1; i >= 0; i--)  {
            const currentSequence = sequences[i];
            const firstNumber = currentSequence[0];

            prevValue = firstNumber - prevValue;
        }

        return prevValue;
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