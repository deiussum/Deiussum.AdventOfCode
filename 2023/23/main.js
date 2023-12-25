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

    map.openUphillPaths();
    const part2Total = map.findLongestPath(); // 6534 is too low, 7500 is too high
    stopwatch.timelog(`Part 2 total: ${part2Total}`); 

    stopwatch.stop();
});

class Map {
    #rows = [];
    #width = 0;
    #height = 0;
    #startingPos = null;
    #endingPos = null;
    #canMoveUp = false;
    #currentLongestCache = [];

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

        let currentLongest = 0;
        let currentFoundLongest = 0;
        const period = stopwatch.startPeriodicLog(5);
        while(paths.length > 0) {
            const path = paths.pop();
            const validDirections = this.#findValidDirectionsForPath(path);
            const currentPosition = path.getCurrentPosition();
            const pathLength = path.getLength();

            currentLongest = Math.max(pathLength, currentLongest);
            stopwatch.periodicLog(period, `Exploring ${paths.length.toLocaleString()} paths (${currentLongest.toLocaleString()} longest).  Found ${finalPaths.length.toLocaleString()} (${currentFoundLongest.toLocaleString()} longest)`);

            if (currentPosition.equals(this.#endingPos)) {
                currentFoundLongest = Math.max(currentFoundLongest, pathLength);
                finalPaths.push(path);
                continue;
            }

            // NOTE: This is making it take longer for some reason... 
            if (!this.#isCurrentLongest(path)) continue;

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

        stopwatch.timelog(`Found ${finalPaths.length} paths. (${maxDistance.toLocaleString()} longest.)`)

        return maxDistance;
    }

    openUphillPaths() {
        this.#canMoveUp = true;
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

        if (!path.hasVisited(north) && this.#isValidBlockForDirection(northBlock, 'N')) validDirections.push('N');
        if (!path.hasVisited(south) && this.#isValidBlockForDirection(southBlock, 'S')) validDirections.push('S');
        if (!path.hasVisited(west) && this.#isValidBlockForDirection(westBlock, 'W')) validDirections.push('W');
        if (!path.hasVisited(east) && this.#isValidBlockForDirection(eastBlock, 'E')) validDirections.push('E');

        return validDirections;
    }

    #isCurrentLongest(path) {
        const currentPathPos = path.getCurrentPosition();
        const pathLength = path.getLength();
        const lastDirection = path.getLastDirection();

        let posCache = this.#currentLongestCache.find((pos) => {
            return pos.pos.equals(currentPathPos);
        });

        if (!posCache) {
            posCache = {
                pos: currentPathPos,
                dir: lastDirection,
                nlength: 0,
                slength: 0,
                wlength: 0,
                elength: 0
            };
            this.#currentLongestCache.push(posCache);
        }

        if (lastDirection === 'N' && posCache.nlength > pathLength) return false;
        if (lastDirection === 'S' && posCache.slength > pathLength) return false;
        if (lastDirection === 'W' && posCache.wlength > pathLength) return false;
        if (lastDirection === 'E' && posCache.elength > pathLength) return false;

        if (lastDirection === 'N')  posCache.nlength = pathLength;
        if (lastDirection === 'S')  posCache.slength = pathLength;
        if (lastDirection === 'W')  posCache.wlength = pathLength;
        if (lastDirection === 'E')  posCache.elength = pathLength;

        return true;
    }

    #isValidBlockForDirection(block, dir) {
        if (block === '#' || block === null) return false;
        if (this.#canMoveUp || block === '.') return true;

        const validBlockDirections = [ 
            { block: '^', dir: 'N'},
            { block: 'v', dir: 'S'},
            { block: '<', dir: 'W'},
            { block: '>', dir: 'E'},
        ];

        return validBlockDirections.some((blockDir) => {
            return blockDir.block === block && blockDir.dir === dir;
        });

    }
}

class Path {
    #id = 0;
    #visited = [];
    #lastDirection = null;

    constructor(id) {
        this.#id = id;
    }

    getId() { return this.#id; }
    getLength() { return this.#visited.length - 1; }
    getLastDirection() { return this.#visited.length - 1; }

    start(pos) {
        this.#visited = [ pos ];
    }

    moveDirection(direction) {
        const newPos = this.getCurrentPosition().moveDirection(direction);
        this.#visited.push(newPos);
        this.#lastDirection = direction;
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