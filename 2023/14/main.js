const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    stopwatch.start();

    const platform = new Platform(lines);

    platform.tiltNorth();

    const part1load = platform.getLoad();
    console.log(`Part 1 load: ${part1load}`);

    stopwatch.stop();
});

class Platform {
    #rows = [];

    constructor(lines) {
        lines.forEach((line) => {
            this.#rows.push(line.split(''));
        });
    }

    tiltNorth() {
        for(let rowIndex=1; rowIndex<this.#rows.length; rowIndex++) {
            const row = this.#rows[rowIndex];
            for(let colIndex=0; colIndex<row.length; colIndex++) {
                const space = row[colIndex];

                if (space === 'O') this.#moveRockN(rowIndex, colIndex);
            }
        }
    }

    getLoad() {
        const load = this.#rows.reduce((platformTotal, currentRow, rowIndex) => {
            return platformTotal + currentRow.reduce((rowTotal, currentCol) => {
                return rowTotal + (currentCol === 'O' ? currentRow.length - rowIndex : 0);
            }, 0);
        }, 0);

        return load;
    }

    #moveRockN(row, col) {
        let newRow = row - 1;
        while(newRow >=0 && this.#rows[newRow][col] === '.') newRow--;

        if (newRow === row - 1) return;
        this.#rows[newRow + 1][col] = 'O';
        this.#rows[row][col] = '.';
    }

}