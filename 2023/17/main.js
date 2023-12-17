const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const city = new City(lines);
    const part1Total = city.getMinimumHeatLoss();
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

const removeItem = (array, item) => {
    const index = array.indexOf(item);
    if (index < 0) return;
    array.splice(index, 1);
}

class City {
    #rows = [];
    #width = 0;
    #height = 0;
    #memo = [];
    #startingBlock = null;
    
    constructor(lines) {
        lines.forEach((line, row) => this.#rows.push(line.split('').map((block, col) => new Block(block, row, col))));
        this.#height = lines.length;
        this.#width = lines[0].length;
    }

    getMinimumHeatLoss() {
        // Build up the cache
        let heat = 0;
        for (let x = 1; x <= this.#width; x++) {
            const pos = this.#width - x;
            this.#startingBlock = this.getBlock(pos, pos);
            const traversedBlocks = [ this.#startingBlock ];
            heat = this.#getMinimumPathFrom(this.#startingBlock.getRow(), this.#startingBlock.getCol(), null, 0, traversedBlocks);
        }

        return heat;
    }

    getBlock(row, col) {
        if (row < 0 || row >= this.#height || col < 0 || col >= this.#width) return null;

        return this.#rows[row][col];
    }

    getWidth() { return this.#width; }
    getHeight() { return this.#height; }

    #getMinimumPathFrom(fromRow, fromCol, direction, directionCount, traversedBlocks) {
        const memoResult = this.#getMemoResult(fromRow, fromCol, direction, directionCount);
        if (memoResult) return memoResult;

        const block = this.getBlock(fromRow, fromCol);
        const isDestination = fromRow === this.#height - 1 && fromCol === this.#width - 1;
        if (isDestination) {
            return this.#memoize(fromRow, fromCol, direction, directionCount, 0);
        }

        const directions = this.#getPossibleDirections(fromRow, fromCol, direction, directionCount);
        let minHeat = null;
        directions.forEach((newDirection) => {
            const newBlock = this.#getBlockInDirection(fromRow, fromCol, newDirection);
            if (!newBlock) return;

            const blockHasBeenTraversed = traversedBlocks.some((searchBlock) => {
                return searchBlock.getRow() === newBlock.getRow()
                    && searchBlock.getCol() === newBlock.getCol();
            });
            if (blockHasBeenTraversed) {
                return;
            }

            if (direction === newDirection && directionCount === 3) {
                return;
            } 

            const newTraversedBlocks = [ ...traversedBlocks];
            newTraversedBlocks.push(newBlock);
            const newDirectionCount = direction === newDirection ? directionCount + 1 : 1
            const minPathForDirection = this.#getMinimumPathFrom(newBlock.getRow(), newBlock.getCol(), newDirection, newDirectionCount, newTraversedBlocks);
            
            if (minPathForDirection === null) { 
                return;
            }
            const heat = newBlock.getHeat() + minPathForDirection;

            minHeat = minHeat ? Math.min(minHeat, heat) : heat;
        });
        if (!minHeat) {
            return null;
        }

        return this.#memoize(fromRow, fromCol, direction, directionCount, minHeat);
    }

    #getBlockInDirection(row, col, direction) {
        let newRow = row;
        let newCol = col;

        switch(direction) {
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
            default: throw `Invalid direction: ${direction}`;
        }

        if (newRow < this.#startingBlock.getRow() || newCol < this.#startingBlock.getCol()) return null;

        return this.getBlock(newRow, newCol);
    }

    #memoize(fromRow, fromCol, direction, directionCount, result) {
        const memo = {
            fromRow, fromCol, direction, directionCount, result
        };
        this.#memo.push(memo);

        return result;
    }

    #getMemoResult(fromRow, fromCol, direction, directionCount) {
        const found = this.#memo.find((memo) => {
            return memo.fromRow === fromRow
                && memo.fromCol === fromCol
                && memo.direction === direction
                && memo.directionCount === directionCount;
        });

        return found ? found.result : null;
    }

    #getPossibleDirections(row, col, direction, directionCount) {
        const directions = ['S', 'E', 'N', 'W'];

        if (col === 0) {
            removeItem(directions, 'W');
        }
        if (col === this.#width - 1) {
            removeItem(directions, 'E');
        }
        if (row === 0) {
            removeItem(directions, 'N');
        }
        if (row === this.#height - 1) {
            removeItem(directions, 'S');
        }

        if (directionCount === 3) removeItem(directions, direction);

        if (direction) removeItem(directions, getOppositeDirection(direction));

        return directions
    }
}

class Block {
    #heat = 0;
    #row = null;
    #col = null;

    constructor(char, row, col) {
        this.#heat = Number(char);
        this.#row = Number(row);
        this.#col = Number(col);
    }

    getHeat() { return this.#heat; }
    getRow() { return this.#row; }
    getCol() { return this.#col; }
}
