const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position } = require('../../common/node/utils');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const map = new Map(lines);

    const part1total = map.plotsReachedAfter(64);
    stopwatch.timelog(`Part 1 total: ${part1total}`);

    stopwatch.stop();
});

class Map {
    #rows = [];
    #width = 0;
    #height = 0;
    #startPosition = null;
    #finalPositions = [];
    #visited = [];

    constructor(lines) {
        this.#rows.push(...lines);
        this.#height = this.#rows.length;
        this.#width = this.#rows[0].length;
        this.#findStartPosition();
    }

    // 3653 is too high
    plotsReachedAfter(steps) {
        let stepQueue = [];
        const isOddSteps = steps % 2 === 1;
        this.#finalPositions = [];
        const period = stopwatch.startPeriodicLog(5);

        let nextPathId = 0;
        stepQueue.push(new StepProgress(this.#startPosition, steps, nextPathId++));

        let maxDistance = 0
        while(stepQueue.length > 0) {
            const stepProgress = stepQueue.pop();
            const position = stepProgress.getPosition();
            const stepsRemaining = stepProgress.getStepsRemaining();
            const pathid = stepProgress.getPathId();
            const distance = steps - stepsRemaining;

            maxDistance = Math.max(distance, maxDistance);
            stopwatch.periodicLog(period, `Travelled ${nextPathId} paths, with the longest ${maxDistance} so far`);

            if (stepsRemaining === 0) {
                this.#addFinalPosition(position);
                continue;
            }

            // If we've already visited a spot and it the same even/odd property as the total
            // steps, we can stop looking at this one because we already know we can get here.
            const remainingIsOdd = stepsRemaining % 2 === 1;
            if (remainingIsOdd === isOddSteps) {
                this.#addFinalPosition(position);
            }
            if (!this.#isShortestVisit(position, distance)) continue;
            this.#visit(position, distance);

            const newDirections = this.#getDirections(stepProgress.getPosition());
            
            newDirections.forEach((newPosition, index) => {
                const newDistance = distance + 1;
                if (!this.#isShortestVisit(newPosition, newDistance)) return;

                const newPathId = index === 0 ? pathid : nextPathId++;
                stepQueue.push(new StepProgress(newPosition, stepsRemaining - 1, newPathId));
            });

            stepQueue = stepQueue.sort((a, b) => a.getStepsRemaining() - b.getStepsRemaining());
        }

        return this.#finalPositions.length;
    }

    isValidPosition(position) {
        if (position.getRow() < 0 || position.getRow() >= this.#height) return false;
        if (position.getCol() < 0 || position.getCol() >= this.#width) return false;
        if (this.#rows[position.getRow()][position.getCol()] === '#') return false;

        return true;
    }

    #isShortestVisit(pos, distance) {
        const visitPos = this.#visited.find((visitPos) => visitPos.pos.equals(pos));
        return !visitPos || visitPos.distance > distance;
    }

    #visit(pos, distance) {
        const visitPos = this.#visited.find((visitPos) => visitPos.pos.equals(pos));
        if (!visitPos) {
            this.#visited.push({ pos, distance });
        } 
        else {
            visitPos.distance = Math.min(visitPos.distance, distance);
        }
    }

    #getDirections(position) {
        const possiblePossitions = [];

        const north = position.moveDirection('N', 1);
        const south = position.moveDirection('S', 1);
        const west = position.moveDirection('W', 1);
        const east = position.moveDirection('E', 1);

        if (this.isValidPosition(north)) possiblePossitions.push(north);
        if (this.isValidPosition(south)) possiblePossitions.push(south);
        if (this.isValidPosition(west)) possiblePossitions.push(west);
        if (this.isValidPosition(east)) possiblePossitions.push(east);

        return possiblePossitions;
    }

    #findStartPosition() {
        const startRow = this.#rows.findIndex((row) => row.indexOf('S') >= 0);
        const startCol = this.#rows[startRow].indexOf('S');
        this.#startPosition = new Position(startRow, startCol);
    }

    #addFinalPosition(position) {
        const exists = this.#finalPositions.some((finalPos) => {
            return finalPos.equals(position)
        });

        if (!exists) {
            // stopwatch.timelog(`Adding ${position.toString()}`);
            this.#finalPositions.push(position);
        }
    }
}

class StepProgress {
    #pathid = null;
    #position = null;
    #stepsRemaining = null;

    constructor(position, stepsRemaining, pathid) {
        this.#position = position;
        this.#stepsRemaining = stepsRemaining;
        this.#pathid = pathid;
    }

    getPosition() { return this.#position; }
    getStepsRemaining() { return this.#stepsRemaining; }
    getPathId() { return this.#pathid; }
}