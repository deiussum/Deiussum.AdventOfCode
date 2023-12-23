const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position3d, NumberSet } = require('../../common/node/utils');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const brickCollection = new BrickCollection(lines);
    const part1Total = brickCollection.getBricksSafeToDisintegrate();
    stopwatch.timelog(`Part 1 total: ${part1Total}`);

    const part2Total = brickCollection.getFallingBrickCount();
    stopwatch.timelog(`Part 2 total: ${part2Total}`); // NOTE: 13112 is too low, 2324298 is too high...

    stopwatch.stop();
});

class Brick {
    #id = null;
    #corner1 = null;
    #corner2 = null;
    #supportsThisBrick = [];
    #thisBrickSupports = [];
    #totalSupportCache = null;

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

    getId() { return this.#id; }

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

    addSupportsThisBrick(bricks) {
        this.#supportsThisBrick.push(...bricks);
    }

    getBricksSupportingThis() {
        return [ ...this.#supportsThisBrick ];
    }

    addThisBrickSupports(bricks) {
        this.#thisBrickSupports.push(...bricks);
    }

    getBricksThisSupports() {
        return [ ...this.#thisBrickSupports ];
    }

    getBricksToFallIfDestroyed(fallingBricks) {
        if (this.#totalSupportCache) return this.#totalSupportCache;

        this.#totalSupportCache = [];

        this.#thisBrickSupports.forEach((brick) => {
            const areAllSupportsFalling = brick.getBricksSupportingThis().every((supportBrick) => {
                return fallingBricks.hasNumber(supportBrick.getId());
            });

            if (!areAllSupportsFalling) return;
            this.#totalSupportCache.push(brick.getId());

            fallingBricks.addNumber(brick.getId());
            const chainBrickIds = brick.getBricksToFallIfDestroyed(fallingBricks);
            this.#totalSupportCache.push(...chainBrickIds);
        });

        return this.#totalSupportCache;
    }
}

class BrickCollection {
    #bricks = [];

    constructor(lines) {
        this.#bricks = lines.map((line, index) => new Brick(line, index));

        this.#bricks = this.#bricks.sort((a, b) => a.getBottom() - b.getBottom());

        this.#settleBlocks();
        this.#linkBricks();
    }

    getBricksSafeToDisintegrate() {
        let total = 0;

        this.#bricks.forEach((brick) => {
            if (this.#canDisintigrateBrick(brick)) {
                total++;
            }
        });

        return total;
    }

    getFallingBrickCount() {
        const bricks = this.#bricks.sort((a, b) => a.getTop() - b.getTop());
        let total = 0;
        while(bricks.length > 0) {
            const nextBrick = bricks.pop();

            if (this.#canDisintigrateBrick(nextBrick)) continue;

            const fallingBricks = new NumberSet();
            fallingBricks.addNumber(nextBrick.getId());
            total += nextBrick.getBricksToFallIfDestroyed(fallingBricks).length;
        }
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
        const bricksThisIsSupporting = brick.getBricksThisSupports(brick);
        if (bricksThisIsSupporting.length === 0) return true;

        const canRemove = bricksThisIsSupporting.every((supportsBrick) => {
            const supportBricks = supportsBrick.getBricksSupportingThis();
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

    #linkBricks() {
        this.#bricks.forEach((brick) => {
            brick.addThisBrickSupports(this.#getBricksThisIsSupporting(brick));
            brick.addSupportsThisBrick(this.#getBricksSupportingThis(brick));
        });
    }
}