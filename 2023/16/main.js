const { dir } = require('console');
const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const grid = new Grid(lines);
    const part1Total = grid.getEnergizedCount();
    stopwatch.timelog(`Part 1 total: ${part1Total}`);

    stopwatch.stop();
});

const getOppositeDirection = (direction) => {
    switch(direction) {
        case 'N': return 'S';
        case 'S': return 'N';
        case 'W': return 'E';
        case 'E': return 'W';
        default: throw `Invalid direction: ${direction}`
    }
}

const get90Degree = (direction, clockwise) => {
    const directions = ['N', 'E', 'S', 'W'];
    const index = directions.indexOf(direction);
    if (index < 0) throw `Invalid direction: ${direction}`;

    let newIndex = (clockwise ? index + 1 : index - 1);
    if (newIndex === -1) newIndex = 3;
    if (newIndex === 4) newIndex = 0;

    return directions[newIndex];
}

class Grid {
    #rows = [];
    #width = 0;
    #height = 0;

    constructor(lines) {
        lines.forEach((line) => {
            this.#rows.push(line.split('').map(char => new GridCell(char)));
        });
        this.#width = this.#rows[0].length;
        this.#height = this.#rows.length;
    }

    getEnergizedCount() {
        this.#traceBeam(0, 0, 'W');

        this.printEnergized();

        const count = this.#rows.reduce((total, row) => {
            return total + row.reduce((rowTotal, cell) => {
                return rowTotal + (cell.isEnergized() ? 1 : 0);
            }, 0);
        }, 0);

        return count;
    }

    printEnergized() {
        const energyString = this.#rows.reduce((fullStr, row) => {
            const rowString = row.reduce((str, cell) => {
                return str + (cell.isEnergized() ? '#' : '.');
            }, '');
            return fullStr + '  ' + rowString + '\r\n';
        }, '\r\n')
        stopwatch.timelog(energyString);
    }

    #traceBeam(row, col, enteredDir) {
        const stack = [];
        stack.push({ row, col, enteredDir});

        while(stack.length > 0) {
            const pathInfo = stack.pop();
            // Exit early if we've ran off the edge of the grid
            if (pathInfo.row < 0 || pathInfo.row >= this.#height || pathInfo.col < 0 || pathInfo.col >= this.#width) continue;

            const cell = this.#rows[pathInfo.row][pathInfo.col];
            const exits = cell.enteredFrom(pathInfo.enteredDir);

            exits.forEach((exit) => {
                let newRow = pathInfo.row;
                let newCol = pathInfo.col;

                switch(exit) {
                    case 'N': 
                        newRow--;
                        break;
                    case 'S':
                        newRow++;
                        break;
                    case 'W':
                        newCol--;
                        break;
                    case 'E':
                        newCol++;
                        break;
                    default: throw `Invalid exit: ${exit}`;
                }

                const entrance = getOppositeDirection(exit);
                stack.push({ row: newRow, col: newCol, enteredDir: entrance });
            });
        }
    }
}

class GridCell {
    #space = null;
    #enteredFrom = [];
    #isEnergized = false;

    constructor(char) {
        this.#space = char;
    }

    enteredFrom(direction) {
        const exits = [];
        // If we've already entered this cell, we can stop because it has already been traced
        if (this.#enteredFrom.indexOf(direction) >= 0) return exits;

        this.#enteredFrom.push(direction);

        this.#isEnergized = true;

        let clockwise = false;
        const oppositeDirection = getOppositeDirection(direction);
        switch(this.#space) {
            case '.': 
                exits.push(oppositeDirection);
                break;
            case '/':
                clockwise = direction === 'N' || direction === 'S';
                exits.push(get90Degree(oppositeDirection, clockwise));
                break;
            case '\\':
                clockwise = direction === 'W' || direction === 'E';
                exits.push(get90Degree(oppositeDirection, clockwise));
                break;
            case '-':
                if (direction === 'N' || direction === 'S') {
                    exits.push('W');
                    exits.push('E');
                }
                else {
                    exits.push(oppositeDirection);
                }
                break;
            case '|':
                if (direction === 'W' || direction === 'E') {
                    exits.push('N');
                    exits.push('S');
                
                }
                else {
                    exits.push(oppositeDirection);
                }
                break;
            default: throw `Invalid space: ${this.#space}`;
        }

        return exits;
    }

    isEnergized() { return this.#isEnergized; }

}