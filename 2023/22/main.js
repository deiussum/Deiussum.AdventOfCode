const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position3d } = require('../../common/node/utils');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const brickCollection = new BrickCollection(lines);
    const part1Total = brickCollection.getBricksSafeToDisintegrate();
    stopwatch.timelog(`Part 1 total: ${part1Total}`);


    stopwatch.stop();
});


class Brick {
    #id = null;
    #corner1 = null;
    #corner2 = null;

    constructor(line, id) {
        const regex = /^(\d+),(\d+),(\d+)~(\d+),(\d+),(\d+)$/
        const matches = regex.exec(line);

        if (!matches || matches.length !== 7) {
            throw `Error parsing line: ${line}`;
        }

        this.#corner1 = new Position3d(matches[1], matches[2], matches[3]);
        this.#corner2 = new Position3d(matches[4], matches[5], matches[6]);
        this.#id = id;
    }

    getBottom() {
        return Math.min(this.#corner1.getZ(), this.#corner2.getZ());
    }

    getTop() {
        return Math.max(this.#corner1.getZ(), this.#corner2.getZ());
    }

    getNEdge() {
        return Math.min(this.#corner1.getY(), this.#corner2.getY());
    }

    getSEdge() {
        return Math.max(this.#corner1.getY(), this.#corner2.getY());
    }

    getWEdge() {
        return Math.min(this.#corner1.getX(), this.#corner2.getX());
    }

    getEEdge() {
        return Math.max(this.#corner1.getX(), this.#corner2.getX());
    }

    isIntersectingWith(other) {
        const xIntersects = other.getEEdge() >= this.getWEdge() && other.getWEdge() <= this.getEEdge();
        const yIntersects = other.getSEdge() >= this.getNEdge() && other.getNEdge() <= this.getSEdge();
        const zIntersects = other.getTop() >= this.getBottom() && other.getBottom() <= this.getTop();

        return xIntersects && yIntersects && zIntersects;
    }

    moveDown(steps) {
        this.#corner1.translate(0, 0, steps * -1);
        this.#corner2.translate(0, 0, steps * -1);
    }
}

class BrickCollection {
    #bricks = [];

    constructor(lines) {
        this.#bricks = lines.map((line, index) => new Brick(line, index));

        this.#bricks = this.#bricks.sort((a, b) => a.getBottom() - b.getBottom());
    }

    getBricksSafeToDisintegrate() {
        let total = 0;
        this.#settleBlocks();

        this.#bricks.forEach((brick) => {
            if (this.#canDisintigrateBrick(brick)) {
                total++;
            }
        });

        return total;
    }

    #settleBlocks() {
        this.#bricks.forEach((brick) => {
            const currentBottom = brick.getBottom();
            if (currentBottom === 1) return;
            const corner1 = new Position3d(brick.getEEdge(), brick.getNEdge(), brick.getBottom() - 1);
            const corner2 = new Position3d(brick.getWEdge(), brick.getSEdge(), 1);

            let bricksUnderneath = this.#findBlocksInArea(corner1, corner2);
            if (bricksUnderneath.length === 0) {
                brick.moveDown(brick.getBottom() - 1);
            }
            else {
                bricksUnderneath = bricksUnderneath.sort((a, b) => a.getTop() - b.getTop());
                const topBrick = bricksUnderneath.at(-1);
                brick.moveDown(brick.getBottom() - topBrick.getTop() - 1);
            }
        });
    }

    #findBlocksInArea(corner1, corner2) {
        const intersectingBlocks = [];
        const brickLine = `${corner1}~${corner2}`;
        const boundingBox = new Brick(brickLine);

        this.#bricks.forEach((brick) => {
            if (brick.isIntersectingWith(boundingBox)) {
                intersectingBlocks.push(brick);
            }
        });

        return intersectingBlocks;
    }

    #canDisintigrateBrick(brick) {
        const bricksThisIsSupporting = this.#getBricksThisIsSupporting(brick);
        if (bricksThisIsSupporting.length === 0) return true;

        const canRemove = bricksThisIsSupporting.every((supportsBrick) => {
            const supportBricks = this.#getBricksSupportingThis(supportsBrick);
            return supportBricks.length > 1;
        });

        return canRemove
    }

    #getBricksThisIsSupporting(brick) {
        const corner1 = new Position3d(brick.getWEdge(), brick.getNEdge(), brick.getTop() + 1);
        const corner2 = new Position3d(brick.getEEdge(), brick.getSEdge(), brick.getTop() + 1);
        return this.#findBlocksInArea(corner1, corner2);
    }

    #getBricksSupportingThis(brick) {
        const corner1 = new Position3d(brick.getWEdge(), brick.getNEdge(), brick.getBottom() - 1);
        const corner2 = new Position3d(brick.getEEdge(), brick.getSEdge(), brick.getBottom() - 1);
        return this.#findBlocksInArea(corner1, corner2);
    }
}