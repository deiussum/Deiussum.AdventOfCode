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
     
    const part2total = hash.getTotalPower();
    stopwatch.timelog(`Part 2 total: ${part2total}`);

    stopwatch.stop();
});

class Hash {
    #hashes = [];
    #boxes = [];
    constructor(line) {
        this.#hashes = line.split(',');
    }

    getSumOfHashes() {
        return this.#hashes.reduce((prev, current) => {
            return prev + this.calculateHash(current);
        }, 0);
    }

    getTotalPower() {
        this.#hashes.forEach(hash => this.#processHash(hash));

        return this.#boxes.reduce((prev, box, index) => {
            return prev + this.#getBoxPower(box) * (index + 1) ;
        }, 0);
    }

    calculateHash(word) {
        let hash = 0;

        for(let i = 0; i < word.length; i++) {
            hash = ((hash + word.charCodeAt(i)) * 17) % 256;
        }

        return hash;
    }

    #getBoxPower(box) {
        if (!box) return 0;

        return box.reduce((prev, lens, index) => {
            return prev + lens.power * (index + 1);
        }, 0);
    }

    #processHash(hash) {    
        const regex = /(\w+)([=-])(\d?)/;
        const matches = regex.exec(hash);

        const op = matches[2];
        const lens = {
            label: matches[1],
            power: Number(matches[3])
        };

        const lensHash = this.calculateHash(lens.label);
        if (!this.#boxes[lensHash]) this.#boxes[lensHash] = [];
        const foundIndex = this.#boxes[lensHash].findIndex(l => l.label === lens.label);

        if (op === '=') {
            if (foundIndex >= 0) {
                this.#boxes[lensHash][foundIndex].power = lens.power;
            } 
            else {
                this.#boxes[lensHash].push(lens);
            }
        } else {
            if (foundIndex >= 0) this.#boxes[lensHash].splice(foundIndex, 1);
        }
    }
}