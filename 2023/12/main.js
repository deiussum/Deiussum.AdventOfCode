const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    stopwatch.start();
    let partItotal = 0;
    let partIItotal = 0;
    lines.forEach((line, index) => {
        console.log(`Processing line ${index + 1}`);
        const springs = new Springs(line);

        partItotal += springs.getPossibleArrangmentCount();

        springs.unfold();
        partIItotal += springs.getPossibleArrangmentCount();
        console.log(`Part 2 so far: ${partIItotal}`);
    });

    console.log(`Part 1 total: ${partItotal}`);
    console.log(`Part 2 total: ${partIItotal}`);

    stopwatch.stop();
});

class Springs {
    #line = '';
    #arrangement = '';
    #groups = [];
    #memo = [];

    constructor(line) {
        this.#line = line;
        this.#parseLine();
    }

    getPossibleArrangmentCount() {
        const requiredEmpty = this.#groups.length - 1;
        let groupSize = 0;
        for(let i = 0; i < this.#groups.length; i++) {
            groupSize += this.#groups[i];
        }
        const extraEmpty = this.#arrangement.length - requiredEmpty - groupSize;
        let count = 0;
        
        for (let start = 0; start <= extraEmpty; start++) {
            const input = '.'.repeat(start)
            count += this.#getArrangementCount(input, 0);
        }

        return count;
    }

    unfold() {
        this.#arrangement += ('?' + this.#arrangement).repeat(4);

        let unfoldedGroups = [];
        for(let i = 0; i < 5; i++) {
            unfoldedGroups = unfoldedGroups.concat(this.#groups);
        }
        this.#groups = unfoldedGroups;
    }

    #parseLine() {
        const splits = this.#line.split(' ');
        this.#arrangement = splits[0];

        const numberSplits = splits[1].split(',');

        numberSplits.forEach((n) => this.#groups.push(Number(n)));
    }

    #getArrangementCount(firstPart, groupIndex) {
        const group = this.#groups[groupIndex];
        const groupString = '#'.repeat(group);
        let newInput = firstPart + groupString;

        if (!this.#matchesPattern(newInput)) return 0;

        const remainingLength = this.#arrangement.length - newInput.length;
        if (groupIndex === this.#groups.length -1) {

            newInput += '.'.repeat(remainingLength);
            
            const newCount = this.#matchesPattern(newInput) ? 1 : 0;
            this.#memoize(firstPart, groupIndex, newCount);

            return newCount;
        }

        const remainingGroups = this.#groups.length - groupIndex - 1;
        let remainingGroupSize = 0;
        for(let i = groupIndex + 1; i < this.#groups.length; i++) {
            remainingGroupSize += this.#groups[i];
        }

        let remainingHashes = 0;
        for (let i = newInput.length; i < this.#arrangement.length; i++) {
            if (this.#arrangement[i] === '#') remainingHashes++;
        }
        if (remainingHashes > remainingGroupSize) return 0;

        const emptySpaceCount = remainingLength - remainingGroupSize - remainingGroups;
        if (emptySpaceCount < 0) return 0;

        if (this.#arrangement[newInput.length] === '#') return 0;

        const memo = this.#findMemo(firstPart, groupIndex);
        if (memo) {
            return memo;
        } 

        var count = 0;
        for(var i = 1; i <= emptySpaceCount + 1; i++) {
            const empty = '.'.repeat(i);
            const addCount = this.#getArrangementCount(newInput + empty, groupIndex + 1);
            count += addCount;
        }

        if (count > 0) this.#memoize(firstPart, groupIndex, count);
        return count;
    }

    #matchesPattern(pattern, length) {
        if (!length) length = pattern.length;
        for(let i = 0; i < length; i++) {
            if (pattern[i] !== this.#arrangement[i] && this.#arrangement[i] !== '?') return false;
        }
        return true;
    }

    #memoize(firstPart, groupIndex, result) {
        // if (result === 0) return;
        const remaining = this.#arrangement.slice(firstPart.length);
        const memo = {
            remaining: remaining,
            groupIndex: groupIndex,
            result: result
        };
        this.#memo.push(memo);
    }

    #findMemo(firstPart, groupIndex) {
        const remaining = this.#arrangement.slice(firstPart.length);

        for(let i = 0; i < this.#memo.length; i++) {
            const memo = this.#memo[i];

            if (memo.remaining === remaining && memo.groupIndex == groupIndex) {
                return memo.result
            }
        }

        return null;
    }
}