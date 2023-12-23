const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position } = require('../../common/node/utils');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const map = new Map(lines);
    const part1Total = map.findLongestPath();
    stopwatch.timelog(`Part 1 total: ${part1Total}`);

    stopwatch.stop();
});

class Map {
    #rows = [];
    #width = 0;
    #height = 0;
    #startingPos = null;
    #endingPos = null;

    constructor(lines) {
        this.#rows = lines;
        this.#height = lines.length;
        this.#width = lines[0].length;
        this.#startingPos = new Position(0, this.#rows[0].indexOf('.'));
        this.#endingPos = new Position(this.#height - 1, this.#rows[this.#height - 1].indexOf('.'));
    }

    findLongestPath() {
        const paths = [];
        const finalPaths = [];
        let nextPathId = 0;
        const initialPath = new Path(nextPathId++);
        initialPath.start(this.#startingPos);
        paths.push(initialPath);

        while(paths.length > 0) {
            const path = paths.pop();
            const validDirections = this.#findValidDirectionsForPath(path);
            const currentPosition = path.getCurrentPosition();

            if (currentPosition.equals(this.#endingPos)) {
                finalPaths.push(path);
                continue;
            }

            validDirections.forEach((direction, index) => {
                const newPathId = index === 0 ? path.getId() : nextPathId++;
                const newPath = path.clone(newPathId);
                newPath.moveDirection(direction);
                paths.push(newPath);
            });
        }

        const maxDistance = finalPaths.reduce((length, path) => {
            return Math.max(length, path.getLength());
        }, 0);

        return maxDistance;
    }

    getBlock(pos) {
        const x = pos.getCol();
        const y = pos.getRow();
        if (x < 0 || x >= this.#width || y < 0 || y >= this.#height) return null;

        return this.#rows[pos.getRow()][pos.getCol()];
    }

    #findValidDirectionsForPath(path) {
        const currentPosition = path.getCurrentPosition();
        const north = currentPosition.moveDirection('N');
        const northBlock = this.getBlock(north);
        const south = currentPosition.moveDirection('S');
        const southBlock = this.getBlock(south);
        const west = currentPosition.moveDirection('W');
        const westBlock = this.getBlock(west);
        const east = currentPosition.moveDirection('E');
        const eastBlock = this.getBlock(east);

        const validDirections = [];

        if (!path.hasVisited(north) && (northBlock === '.' || northBlock === '^')) validDirections.push('N');
        if (!path.hasVisited(south) && (southBlock === '.' || southBlock === 'v')) validDirections.push('S');
        if (!path.hasVisited(west) && (westBlock === '.' || westBlock === '<')) validDirections.push('W');
        if (!path.hasVisited(east) && (eastBlock === '.' || eastBlock === '>')) validDirections.push('E');

        return validDirections;
    }
}

class Path {
    #id = 0;
    #visited = [];

    constructor(id) {
        this.#id = id;
    }

    getId() { return this.#id; }
    getLength() { return this.#visited.length - 1; }

    start(pos) {
        this.#visited = [ pos ];
    }

    moveDirection(direction) {
        const newPos = this.getCurrentPosition().moveDirection(direction);
        this.#visited.push(newPos);
    }

    getCurrentPosition() {
        return this.#visited.at(-1);
    }

    clone(newId) {
        const newPath = new Path(newId);
        newPath.#visited = [ ...this.#visited ];
        return newPath;
    }

    hasVisited(pos) {
        return this.#visited.some((visitedPos) => pos.equals(visitedPos));
    }
}