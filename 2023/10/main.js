const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const TEST_INPUT2 = 'input-test2.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) stopwatch.timelog('No input to process');

    stopwatch.start();

    const maze = new Maze(lines);
    const start = maze.getStart();
    stopwatch.timelog(`Maze starts at row ${start.row + 1}, col ${start.col + 1}, pipe: ${start.pipe}`);

    const length = maze.getPipeLength();
    const furthestPoint = Math.ceil(length / 2);
    const enclosedTiles = maze.getEnclosedTiles();
    stopwatch.timelog(`Pipe length: ${length}, Furthest Point: ${furthestPoint}, Enclosed Tiles: ${enclosedTiles}`);

    stopwatch.stop();
});

class Maze {
    #lines = [];
    #startPosition = { };
    #width;
    #height;
    #loop = [];
    constructor(lines) {
        this.#lines = lines;
        this.#height = lines.length;
        this.#width = lines[0].length;
        this.#getStart();
    }

    getPosition(col, row) {
        if (col < 0 || col > this.#width - 1 || row < 0 || row > this.#height - 1) return null;
        return this.#lines[row][col];
    }

    getStart() { return this.#startPosition; }

    getPipeLength() {
        let currentPosition = {
            col: this.#startPosition.col,
            row: this.#startPosition.row
        };
        let currentPipe = this.#startPosition.pipe;
        const startExits = this.#getExits(currentPipe);
        let currentDirection = startExits[0];
        let currentLength = 0;

        while(true) {
            this.#loop.push(currentPosition);
            currentPosition = this.#getNextTo(currentDirection, currentPosition.col, currentPosition.row);
            currentPipe = this.getPosition(currentPosition.col, currentPosition.row);
            
            if (currentPipe == 'S') break;

            currentDirection = this.#getPipeExit(currentPipe, currentDirection);
            currentLength++;
        }

        return currentLength;
    }

    getEnclosedTiles() {
        let tileCount = 0;

        // Enclosed tiles will be tiles that are not part of the loop and have an odd number of walls to the left and right
        for (let rowIndex = 0; rowIndex < this.#height; rowIndex++) {
            let wallCount = 0;
            let horizPipeStart = '';
            for (let colIndex = 0; colIndex < this.#width; colIndex++) {
                let tile = this.getPosition(colIndex, rowIndex);
                if (tile === 'S') tile = this.#startPosition.pipe;
                const isLoop = this.#isPartOfLoop(colIndex, rowIndex);

                if (isLoop && (tile === 'F' || tile === 'L')) horizPipeStart = tile;
                if (isLoop && (tile === '|' || tile === '7' || tile === 'J')) wallCount++

                // If the loop segment is the edge of a loop where both edges go up or down, don't count it as a wall.
                if (isLoop && horizPipeStart === 'F' && tile === '7') wallCount--;
                if (isLoop && horizPipeStart === 'L' && tile === 'J') wallCount--;
                if (tile === '7' || tile === 'J') horizPipeStart = '';

                if (!isLoop && wallCount % 2 === 1) {
                    tileCount++;
                    stopwatch.timelog(`Enclosed tile found at row ${rowIndex + 1}, col ${colIndex + 1}`);
                }
            }
        }
        return tileCount;
    }

    #getStart() {
        this.#lines.forEach((line, index) => {
            const startIndex = line.indexOf('S');
            if (startIndex >= 0) {
                this.#startPosition.col = startIndex;
                this.#startPosition.row = index;
            }
        });

        const n = this.#getNextTo('N', this.#startPosition.col, this.#startPosition.row);
        const nPipe = n !== null ? this.getPosition(n.col, n.row) : null;
        const s = this.#getNextTo('S', this.#startPosition.col, this.#startPosition.row);
        const sPipe = s !== null ? this.getPosition(s.col, s.row) : null;
        const w = this.#getNextTo('W', this.#startPosition.col, this.#startPosition.row);
        const wPipe = w !== null ? this.getPosition(w.col, w.row) : null;
        const e = this.#getNextTo('E', this.#startPosition.col, this.#startPosition.row);
        const ePipe = e !== null ? this.getPosition(e.col, e.row) : null;
        
        const startExits = [];

        if (this.#pipeHasExit(nPipe, 'S')) startExits.push('N');
        if (this.#pipeHasExit(sPipe, 'N')) startExits.push('S');
        if (this.#pipeHasExit(wPipe, 'E')) startExits.push('W');
        if (this.#pipeHasExit(ePipe, 'W')) startExits.push('E');

        this.#startPosition.pipe = this.#getPipe(startExits);
    }

    #getNextTo(direction, col, row) {
        switch(direction) {
            case 'N': return { col: col, row: row - 1 };
            case 'S': return { col: col, row: row + 1 };
            case 'W': return { col: col - 1, row: row };
            case 'E': return { col: col + 1, row: row };
        }
    }

    #getExits(pipe) {
        switch(pipe) {
            case '|': return ['N', 'S'];
            case '-': return ['W', 'E'];
            case 'L': return ['N', 'E'];
            case 'J': return ['N', 'W'];
            case '7': return ['S', 'W'];
            case 'F': return ['S', 'E'];
            default: return null;
        }
    }

    #getPipe(exits) {
        if (exits.length !== 2) throw 'Invalid number of exits';

        const hasN = this.#hasExit(exits, 'N');
        const hasS = this.#hasExit(exits, 'S');
        const hasW = this.#hasExit(exits, 'W');
        const hasE = this.#hasExit(exits, 'E');

        if (hasN && hasS) return '|';
        if (hasW && hasE) return '-';
        if (hasN && hasW) return 'J';
        if (hasN && hasE) return 'L';
        if (hasS && hasW) return '7';
        if (hasS && hasE) return 'F';

        return null;
    }

    #hasExit(exits, exit) {
        return exits.indexOf(exit) >= 0;
    }

    #pipeHasExit(pipe, exit) {
        const pipeExits = this.#getExits(pipe);
        if (pipeExits === null) return false;

        return this.#hasExit(pipeExits, exit);
    }

    #getOppositeDirection(direction) {
        switch(direction) {
            case 'N': return 'S';
            case 'S': return 'N';
            case 'W': return 'E';
            case 'E': return 'W';
            default: return null;
        }
    }

    #getPipeExit(pipe, fromDirection) {
        const pipeExits = this.#getExits(pipe);
        const enteredExit = this.#getOppositeDirection(fromDirection);

        const exit = pipeExits[0] == enteredExit ? pipeExits[1] : pipeExits[0];
        return exit;
    }

    #isPartOfLoop(col, row) {
        for(let i = 0; i < this.#loop.length; i++) {
            if (this.#loop[i].col === col && this.#loop[i].row === row) return true;
        }

        return false;
    }
}
