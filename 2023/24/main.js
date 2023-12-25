const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position, Position3d, Vector3d, Vector2d } = require('../../common/node/utils');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';
const useTestData = false;

readfile.readfile(useTestData ? TEST_INPUT : INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const hailstorm = new Hailstorm(lines);
    const pos1 = useTestData ? new Position(7, 7) : new Position(200000000000000, 200000000000000);
    const pos2 = useTestData ? new Position(27, 27) : new Position(400000000000000, 400000000000000);

    const intersections = hailstorm.getIntersectionsWithin2d(pos1, pos2);
    const part1Total = intersections.length;
    stopwatch.timelog(`Part 1 total: ${part1Total}`);

    stopwatch.stop();
});

class Hailstorm {
    #vectors = [];

    constructor(lines) {
        this.#vectors = lines.map((line) => this.#parseVector(line));
    }

    getIntersectionsWithin2d(pos1, pos2) {

        const found = [];

        for(let i = 0; i < this.#vectors.length - 1; i++) {
            for(let j = i + 1; j < this.#vectors.length; j++) {
                const vec1 = this.#vectors[i].flattenXY();
                const vec2 = this.#vectors[j].flattenXY();
                const minX = Math.min(pos1.getX(), pos2.getX());
                const maxX = Math.max(pos1.getX(), pos2.getX());
                const minY = Math.min(pos1.getY(), pos2.getY());
                const maxY = Math.max(pos1.getY(), pos2.getY());


                const intersection = vec1.intersection(vec2);
                if (!intersection) continue;

                const x = intersection.getX();
                const y = intersection.getY();

                if (x < minX || x > maxX ) continue;
                if (y < minY || y > maxY) continue;

                if (vec1.isHeadingTowards(intersection) && vec2.isHeadingTowards(intersection)) {
                    found.push({vec1, vec2, intersection});
                }
            }
        }

        return found;
    }

    #parseVector(line) {
        const parts = line.split('@');
        const posParts = parts[0].split(',');
        const vecParts = parts[1].split(',');
        const pos = new Position3d(posParts[0], posParts[1], posParts[2]);
        const vec = new Position3d(vecParts[0], vecParts[1], vecParts[2]);
        return new Vector3d(pos, vec);
    }
}

