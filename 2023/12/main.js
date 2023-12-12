const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    stopwatch.start();
    let partItotal = 0;
    lines.forEach((line) => {
        const springs = new Springs(line);

        partItotal += springs.getPossibleArrangmentCount();
    });

    console.log(`Part 1 total: ${partItotal}`);

    stopwatch.stop();
});

class Springs {
    #line = '';
    #arrangement = '';
    #groups = [];

    constructor(line) {
        this.#line = line;
        this.#parseLine();
    }

    getPossibleArrangmentCount() {
        const arrangements = this.#getPossibleArrangements();

        let count = 0;
        arrangements.forEach((arr) => {
            if (this.#matchesPattern(arr)) count++;
        });

        return count;
    }

    #parseLine() {
        const splits = this.#line.split(' ');
        this.#arrangement = splits[0];

        const numberSplits = splits[1].split(',');

        numberSplits.forEach((n) => this.#groups.push(Number(n)));
    }

    #getPossibleArrangements() {
        const startEndOptions = [];
        let sum = 0;
        this.#groups.forEach((group) => sum += group);
        const minEmpty = this.#groups.length - 1;
        const extraEmpty = this.#arrangement.length - sum - minEmpty;

        for (let start = 0; start <= extraEmpty; start++) {
            startEndOptions.push('.'.repeat(start));
        }

        const middleOptions = this.#combineLists(startEndOptions, [ '.' ]);
        let arrangements = startEndOptions;
        for(let i = 0; i < this.#groups.length; i++) {
            const groupSize = this.#groups[i];
            let group = '#'.repeat(groupSize);

            arrangements = this.#combineLists(arrangements, [ group ]);
            const groupOptions = [];

            const isLast = i === this.#groups.length - 1;
            if (isLast) continue;
            arrangements = this.#combineLists(arrangements, middleOptions);

        }

        arrangements = this.#combineLists(arrangements, startEndOptions);

        const possibleOptions = [];

        arrangements.forEach((x) => {
            if (x.length === this.#arrangement.length) {
                possibleOptions.push(x);
            }
        });

        return possibleOptions;
    }

    #combineLists(list1, list2) {
        const newList = [];

        list1.forEach((x) => {
            list2.forEach((y) => {
                newList.push(x + y);
            });
        });

        return newList;
    }

    #matchesPattern(pattern) {
        for(let i = 0; i < pattern.length; i++) {
            if (pattern[i] !== this.#arrangement[i] && this.#arrangement[i] !== '?') return false;
        }
        return true;
    }
}