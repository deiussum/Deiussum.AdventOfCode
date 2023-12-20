const { get } = require('http');
const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position } = require('../../common/node/utils');

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
    
    constructor(lines) {
        lines.forEach((line, row) => this.#rows.push(line.split('').map((block, col) => new Block(block, row, col))));
        this.#height = lines.length;
        this.#width = lines[0].length;
    }

    isEndPosition(pos) {
        return pos.getRow() === this.#height - 1 && pos.getCol() === this.#width - 1;
    }

    getMinimumHeatLoss() {
        return this.#getMinimumHeatLoss(new Position(0, 0), null, 0);
    }

    #getMinimumHeatLoss(startPos, initialDirection, initialCount) {
        const pathQueue = new PathQueue();
        const initialPath = new Path(this);

        initialPath.start(startPos, initialDirection, initialCount);

        pathQueue.push(initialPath);

        let heat = 0
        var found = false;
        let maxHeat = 0;
        let minDistance = this.#width + this.#height;
        const startTime = new Date();
        let loggedSecond = 0;
        while(!found && pathQueue.getLength() > 0) {
            const path = pathQueue.shift();
            const block = this.getBlock(path.getCurrentPosition());
            if (!block.isEasiestPath(path)) continue;

            maxHeat = Math.max(maxHeat, path.getHeat());
            minDistance = Math.min(minDistance, path.getDistanceToEnd());

            // Log progress every 5 seconds
            const elapsedSeconds = Math.floor((new Date() - startTime) / 1000);
            if (elapsedSeconds % 5 === 0 && elapsedSeconds !== loggedSecond) {
                loggedSecond = elapsedSeconds;
                stopwatch.timelog(`Queue : ${pathQueue.getLength()} - Heat: ${maxHeat} - Remaining Distance: ${minDistance}`);
            }
            const newPaths = path.split();
            newPaths.forEach((newPath) => {
                const newHeat = newPath.getHeat();
                const newPathPos = newPath.getCurrentPosition();

                if (this.isEndPosition(newPath.getCurrentPosition())) {
                    heat = newHeat;
                    found = true;
                }
                else {
                    const block = this.getBlock(newPathPos);
                    if (!block.isEasiestPath(newPath)) return;
                    pathQueue.push(newPath);
                }
            });
        }

        return heat;
    }

    getBlock(pos) {
        if (!this.isValidPosition(pos)) return null;

        return this.#rows[pos.getRow()][pos.getCol()];
    }

    getWidth() { return this.#width; }
    getHeight() { return this.#height; }

    isValidPosition(pos) {
        return pos.getRow() >= 0 
            && pos.getRow() < this.#height 
            && pos.getCol() >= 0 
            && pos.getCol() < this.#width;

    }

    getDistanceFromEnd(pos) {
        return (this.#width - pos.getCol()) + (this.#height - pos.getRow());
    }
}

class Block {
    #heat = 0;
    #position = null;
    #easiestPaths = [];

    constructor(char, row, col) {
        this.#heat = Number(char);
        this.#position = new Position(Number(row), Number(col));
    }

    getHeat() { return this.#heat; }
    getPosition() { return this.#position; }

    isEasiestPath(path) {
        const direction = path.getDirection();
        const directionCount = path.getDirectionCount();
        const heat = path.getHeat();

        const foundPath = this.#easiestPaths.find((checkPath) => {
            return checkPath.direction === direction
                && checkPath.directionCount === directionCount;
        });

        if (foundPath && foundPath.heat < heat) return false;

        if (foundPath) {
            foundPath.heat = heat;
        }
        else {
            const newPath = {
                direction: direction,
                directionCount: directionCount,
                heat: heat
            };
            this.#easiestPaths.push(newPath);
        }

        return true;
    }
}

class Path {
    #city = null;
    #visited = [];
    #direction = null;
    #directionCount = 0;
    #heat = 0;

    constructor(city) {
        this.#city = city;
    }

    getHeat() { return this.#heat; }
    getDirection() { return this.#direction; }  
    getDirectionCount() { return this.#directionCount; }

    getDistanceToEnd() {
        const pos = this.getCurrentPosition();
        return this.#city.getDistanceFromEnd(pos)
    }
    getPriority() { 
        return this.getDistanceToEnd() + this.#heat;
    }

    start(position, direction, count) {
        this.#direction = direction;
        this.#directionCount = count;
        this.#heat = 0;

        if (direction !== null && count > 0) {
            let curPos = position;
            let curCount = count;
            while(curCount > 0) {
                const block = this.#city.getBlock(position);
                this.#heat += block.getHeat();

                curPos = curPos.moveDirection(getOppositeDirection(direction));
                curCount--;
            }
        }
            
        this.#visited.push(position);
    }

    split() {
        const newPaths = [];

        const directions = this.#getPossibleDirections();
        directions.forEach((direction) => {
            const newPath = new Path(this.#city);
            newPath.#copy(this.#visited, this.#direction, this.#directionCount, this.#heat);
            newPath.moveDirection(direction);

            newPaths.push(newPath);
        });

        return newPaths;
    }

    moveDirection(direction) {
        const pos = this.getCurrentPosition();
        const newPos = pos.moveDirection(direction);

        if (!this.#city.isValidPosition(newPos) || this.hasVisited(newPos)) {
            throw `Invalid move: ${direction}`;
        }

        if (this.#direction === direction) {
            this.#directionCount++;
        } 
        else {
            this.#directionCount = 1;
        }
        this.#direction = direction;
        
        const block = this.#city.getBlock(newPos);
        this.#heat += block.getHeat();

        this.#visited.push(newPos);
    }

    getCurrentPosition() {
        return this.#visited.at(-1);
    }

    hasVisited(position) {
        return this.#visited.find((pos) => {
            return pos.getRow() === position.getRow()
                && pos.getCol() === position.getCol();
        });
    }

    #copy(visited, direction, directionCount, heat) {
        this.#visited = [ ...visited];
        this.#direction = direction;
        this.#directionCount = directionCount;
        this.#heat = heat;
    }

    #getPossibleDirections() {
        const directions = ['S', 'E', 'N', 'W'];
        const pos = this.getCurrentPosition();

        const invalidDirections = [];
        directions.forEach((direction) => {
            const newPos = pos.moveDirection(direction);
            if (!this.#city.isValidPosition(newPos) || this.hasVisited(newPos)) {
                invalidDirections.push(direction);
            }
        });

        invalidDirections.forEach((direction) => removeItem(directions, direction));

        if (this.#directionCount === 3) {
            removeItem(directions, this.#direction);
        }

        if (this.#direction) {
            removeItem(directions, getOppositeDirection(this.#direction));
        }

        return directions
    }
}

class PathQueue {
    #paths = [];

    push(path) {
        this.#paths.push(path);
    }

    shift() {
        this.#paths.sort((a, b) => Number(a.getPriority()) - Number(b.getPriority()));
        return this.#paths.shift();
    }

    getLength() {
        return this.#paths.length;
    }
}