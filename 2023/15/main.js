const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const hash = new Hash(lines[0]);
    const part1total = hash.getSumOfHashes();

    stopwatch.timelog(`Part 1 total: ${part1total}`);
     
    stopwatch.stop();
});

class Hash {
    #hashes = [];
    constructor(line) {
        this.#hashes = line.split(',');
    }

    getSumOfHashes() {
        return this.#hashes.reduce((prev, current) => {
            return prev + this.calculateHash(current);
        }, 0);
    }

    calculateHash(word) {
        let hash = 0;

        for(let i = 0; i < word.length; i++) {
            hash = ((hash + word.charCodeAt(i)) * 17) % 256;
        }

        return hash;
    }
}