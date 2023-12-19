const { readfile, appendfile, deletefile } = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position } = require('../../common/node/utils');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';
const MY_INPUT = 'my-input.txt';

readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const lagoon = new Lagoon(lines);
    lagoon.fill();

    const part1total = lagoon.getSize();
    stopwatch.timelog(`Part 1: ${part1total}`);

    lagoon.fixInstructions();
    lagoon.fill();

    const part2total = lagoon.getSize();
    stopwatch.timelog(`Part 2: ${part2total}`);

    stopwatch.stop();
});

class Lagoon {
    #instructions = []
    #rows = [];
    #width = 0;
    #height = 0;

    constructor(lines) {
        this.#instructions = lines.map((line) => new Instruction(line));
        this.#processInstructions();
    }

    fill() {
        stopwatch.timelog('Filling lagoon...');
        let period = stopwatch.startPeriodicLog(5);

        for(let y = 1; y < this.#height - 1; y++) {
            let wallsCrossed = 0;
            let wall = 0;
            let wallUp = 0;
            let wallDown = 0;
            const percentDone = (y * 100 / this.#height).toFixed(2);
            stopwatch.periodicLog(period, `Percent done ${percentDone}$`);

            for(let x = 0; x < this.#width; x++) {
                const block = this.#rows[y][x];
                const blockUp = this.#rows[y-1][x];
                const blockDown = this.#rows[y+1][x];

                if (blockUp.block === '#') wallUp++;
                if (blockDown.block === '#') wallDown++;
                if (block.block === '#') {
                    wall++;
                    continue;
                }

                const newWallsCrossed = Math.min(wall, wallUp, wallDown);

                wallsCrossed += newWallsCrossed;

                wall = 0;
                wallUp = 0;
                wallDown = 0;

                const inside = wallsCrossed % 2 === 1;
                if (inside) block.block = '#';
            }
        }
    }

    getSize() {
        return this.#rows.reduce((total, row) => {
            return total + row.reduce((rowTotal, block) => {
                return rowTotal + (block.block === '#' ? 1 : 0);
            }, 0);
        }, 0);
    }

    fixInstructions() {
        this.#instructions.forEach(instruction => instruction.fix());
        this.#processInstructions();
    }

    toString() {
        return '\r\n  ' + this.#rows.reduce((str, row) => {
            return str + row.reduce((rowStr, block) => {
                return rowStr + block.block;
            }, '') + '\r\n  ';
        }, '');
    }

    #processInstructions() {
        let pos = this.#buildEmptyGrid();
        this.#digTrench(pos);
    }

    #buildEmptyGrid() {
        stopwatch.timelog('Building initial grid...');
        let currentPosition = new Position(0, 0);
        let minX = 0, maxX = 0, minY = 0, maxY = 0;

        stopwatch.timelog('Getting size of grid...');
        this.#instructions.forEach((instruction) => {

            let currentLength = instruction.getLength();
            while(currentLength > 0) {
                currentPosition = currentPosition.moveDirection(instruction.getDirection());
                const row = currentPosition.getRow();
                const col = currentPosition.getCol();
                minX = Math.min(minX, col);
                minY = Math.min(minY, row);
                maxX = Math.max(maxX, col);
                maxY = Math.max(maxY, row);

                currentLength--;
            }
        });

        this.#width = maxX - minX + 1;
        this.#height = maxY - minY + 1;
        this.#rows = [];

        stopwatch.timelog(`Building empty grid (width: ${this.#width}, height: ${this.#height})...`);
        let period = stopwatch.startPeriodicLog(5);

        for(let y = 0; y < this.#height; y++) {
            const percentDone = (y * 100 / this.#height).toFixed(2);
            stopwatch.periodicLog(period, `Percent done: ${percentDone}`);

            const row = [];
            this.#rows.push(row);
            for(let x = 0; x < this.#width; x++) {
                const percentDone = (y * x * 100 / (this.#height * this.#width)).toFixed(2);
                stopwatch.periodicLog(period, `Percent done: ${percentDone}`);

                row.push({ block: '.' });
            }
        }

        return (new Position(minY * -1, minX * -1));
    }

    #digTrench(startingPos) {
        stopwatch.timelog('Digging trench...');
        let currentPosition = startingPos;

        let period = stopwatch.startPeriodicLog(5);
        this.#instructions.forEach((instruction, index) => {
            const percentDone = (index * 100 / this.#instructions.length).toFixed(2);
            stopwatch.periodicLog(period, `Percent done: ${percentDone}`);

            let currentLength = instruction.getLength();
            while(currentLength > 0) {
                const row = currentPosition.getRow();
                const col = currentPosition.getCol();
                this.#rows[row][col].block = '#';
                this.#rows[row][col].color = instruction.getColor();

                currentPosition = currentPosition.moveDirection(instruction.getDirection());
                currentLength--;
            }
        });
    }
}

class Instruction {
    #direction = null;
    #length = null;
    #color = null;

    constructor(line) {
        const regex = /(\w) (\d+) \((.*)\)/;
        const matches = regex.exec(line);
        this.#direction = matches[1];
        this.#length = matches[2];
        this.#color = matches[3];
    }

    getDirection() { return this.#direction; }
    getLength() { return this.#length; }
    getColor() { return this.#color; }

    fix() {
        this.#length = Number('0x' + this.#color.slice(1, 6));
        this.#direction = this.#getDirection(this.#color.slice(-1));
    }

    #getDirection(num) {
        switch(num) {
            case '0': return 'R';
            case '1': return 'D';
            case '2': return 'L';
            case '3': return 'U';
            default: throw `Invalid direction ${num}`;
        }
    }
}