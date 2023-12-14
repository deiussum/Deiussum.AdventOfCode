const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const platform = new Platform(lines);

    platform.tiltNorth();

    const part1load = platform.getLoad();
    stopwatch.timelog(`Part 1 load: ${part1load}`);

    const platform2 = new Platform(lines);

    platform2.spinCycle(1000000000);

    const part2load = platform2.getLoad();
    stopwatch.timelog(`Part 2 load: ${part2load}`);

    stopwatch.stop();
});

class Platform {
    #rows = [];
    #snapshots = [];
    #rowCount = 0;
    #colCount = 0;

    constructor(lines) {
        lines.forEach((line) => {
            // Strings are immutable so store the lines as an array of characters instead
            this.#rows.push(line.split(''));
        });
        this.#rowCount = this.#rows.length;
        this.#colCount = this.#rows[0].length;
    }

    spinCycle(count) {
        for(let i=0; i<count; i++) {
            this.tiltNorth();
            this.tiltWest();
            this.tiltSouth();
            this.tiltEast();

            const snapshotIndex = this.#findSnapshot();
            if (snapshotIndex >= 0) {
                const cycleLength = i - snapshotIndex;
                const remainingCycles = Math.floor((count - i)/cycleLength);
                const remainder = count - i - remainingCycles * cycleLength - 1;

                this.#restoreSnapshot(snapshotIndex + remainder);
                break;
            }
            else {
                this.#saveSnapshot();
            }
        }
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

    tiltSouth() {
        for(let rowIndex=this.#rowCount - 2; rowIndex >= 0; rowIndex--) {
            const row = this.#rows[rowIndex];
            for(let colIndex=0; colIndex<row.length; colIndex++) {
                const space = row[colIndex];

                if (space === 'O') this.#moveRockS(rowIndex, colIndex);
            }
        }
    }

    tiltWest() {
        for(let colIndex=1; colIndex<this.#colCount; colIndex++) {
            for(let rowIndex=0; rowIndex<this.#rowCount; rowIndex++) {
                const space = this.#rows[rowIndex][colIndex];

                if (space === 'O') this.#moveRockW(rowIndex, colIndex);
            }
        }
    }

    tiltEast() {
        for(let colIndex=this.#colCount - 2; colIndex >= 0; colIndex--) {
            for(let rowIndex=0; rowIndex<this.#rowCount; rowIndex++) {
                const space = this.#rows[rowIndex][colIndex];

                if (space === 'O') this.#moveRockE(rowIndex, colIndex);
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

    #moveRockS(row, col) {
        let newRow = row + 1;
        while(newRow < this.#rowCount && this.#rows[newRow][col] === '.') newRow++;

        if (newRow === row + 1) return;
        this.#rows[newRow - 1][col] = 'O';
        this.#rows[row][col] = '.';
    }

    #moveRockW(row, col) {
        let newCol = col - 1;
        while(newCol >=0 && this.#rows[row][newCol] === '.') newCol--;

        if (newCol === col - 1) return;
        this.#rows[row][newCol + 1] = 'O';
        this.#rows[row][col] = '.';
    }

    #moveRockE(row, col) {
        let newCol = col + 1;
        while(newCol < this.#colCount && this.#rows[row][newCol] === '.') newCol++;

        if (newCol === col + 1) return;
        this.#rows[row][newCol - 1] = 'O';
        this.#rows[row][col] = '.';
    }

    #saveSnapshot() {
        const snapshot = this.#rows.map((row) => row.join(''));
        this.#snapshots.push(snapshot);
        return snapshot;
    }

    #restoreSnapshot(snapshotIndex) {
        const snapshot = this.#snapshots[snapshotIndex];
        this.#rows = snapshot.map((row) => row.split(''));
    }

    #findSnapshot() {
        const curSnapshot = this.#rows.map((row) => row.join(''));
        let foundIndex = -1;
        this.#snapshots.forEach((snapshot, index) => {
            if (this.#comparePlatforms(curSnapshot, snapshot)) {
                foundIndex = index;
            }
        });
        return foundIndex;
    }

    #comparePlatforms(platform1, platform2) {
        for(let i=0; i<this.#rowCount; i++) {
            if (platform1[i] !== platform2[i]) {
                return false;
            }
        }
        return true;
    }
}