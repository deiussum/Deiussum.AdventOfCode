const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    let partItotal = 0;
    let partIItotal = 0;
    lines.forEach((line, index) => {
        const springs = new Springs(line);

        partItotal += springs.getPossibleArrangmentCount();

        springs.unfold();
        partIItotal += springs.getPossibleArrangmentCount();
        // stopwatch.timelog(`Part 2 so far: ${partIItotal}`);
    });

    stopwatch.timelog(`Part 1 total: ${partItotal}`);
    stopwatch.timelog(`Part 2 total: ${partIItotal}`);

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
        const count = this.#getArrangementCountMemo(this.#arrangement, this.#groups);

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

    #getArrangementCountMemo(line, groups) {
        const memo = this.#findMemo(line, groups.length);
        if (memo !== null) return memo;

        const count = this.#getArrangementCount(line, groups);
        this.#memoize(line, groups.length, count);
        return count;
    }

    #getArrangementCount(line, groups) {

        if (groups.length === 0) {
            return line.indexOf('#') === -1 ? 1 : 0;
        }
        else if (line.length === 0) {
            return 0;
        }

        const sum = groups.reduce((a, b) => a + b, 0);

        if (line.length < sum + groups.length - 1) {
            return 0;
        }

        const nextChar = line[0];
        switch(nextChar) {  
            case '?': return this.processDot(line, groups) + this.processHash(line, groups);
            case '.': return this.processDot(line, groups);
            case '#': return this.processHash(line, groups);
        }
    }

    processDot(line, groups) {
        return this.#getArrangementCountMemo(line.slice(1), groups);
    }

    processHash(line, groups) {
        const hasDots = line.substring(0, groups[0]).indexOf('.') !== -1;
        const followedByHash = line[groups[0]] === '#';

        return hasDots || followedByHash ? 0 : this.#getArrangementCountMemo(line.slice(groups[0] + 1), groups.slice(1));
    }

    #memoize(line, groupCount, result) {
        const memo = {
            line: line,
            groupCount: groupCount,
            result: result
        };
        this.#memo.push(memo);
    }

    #findMemo(line, groupCount) {
        for(let i = 0; i < this.#memo.length; i++) {
            const memo = this.#memo[i];

            if (memo.line === line && memo.groupCount == groupCount) {
                return memo.result
            }
        }

        return null;
    }
}