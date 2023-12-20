const { readfile, writefile } = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');
const { Position, NumberSet } = require('../../common/node/utils');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';
const MY_INPUT = 'my-input.txt';

readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const lagoon = new Lagoon(lines);
    const part1total = lagoon.getArea();
    stopwatch.timelog(`Part 1: ${part1total}`);

    lagoon.fixInstructions();
    const part2total = lagoon.getArea();

    lagoon.saveSvg('map.svg', 0.001);
    lagoon.saveSquaresSvg('mapSquares.svg', 0.001);
    lagoon.saveDebugInfo('debug.csv');

    stopwatch.timelog(`Part 2: ${part2total}`);

    stopwatch.stop();
});

class Lagoon {
    #instructions = [];
    #lineSegments = [];
    #squares = [];
    #overlaps = [];
    #horizontalSplits = new NumberSet();
    #verticalSplits = new NumberSet();
    #width = 0;
    #height = 0;

    constructor(lines) {
        this.#instructions = lines.map((line) => new Instruction(line));
        this.#processInstructions();
    }

    getArea() {
        const horizontalLines = this.#horizontalSplits.getNumbers();
        let totalArea = 0;
        this.#squares = [];
        this.#overlaps = [];

        const horizontalSegments = [];
        horizontalLines.forEach((y, index) => {
            if (index === horizontalLines.length - 1) return;
            const intersections = this.#findIntersections(y);
            const nextY = horizontalLines[index + 1];

            let intersectionCount = 0;
            intersections.forEach((x, index) => {
                if (intersectionCount % 2 == 1) {
                    const prevX = intersections[index - 1];
                    const width = x - prevX + 1;
                    const height = nextY - y + 1;
                    const area = width * height;

                    const topSegment = new LineSegment(new Position(y, prevX), new Position(y, x));
                    const bottomSegment = new LineSegment(new Position(nextY, prevX), new Position(nextY, x));

                    horizontalSegments.push(topSegment, bottomSegment);
                    const square = {
                        point1: new Position(y, prevX),
                        point2: new Position(nextY, x),
                        area
                    };
                    this.#squares.push(square);

                    totalArea += area;
                }
                intersectionCount++;
            });
        });

        // Fix any overlap in horizontal segments that got counted twice
        let overage = 0;
        horizontalSegments.forEach((segment1, index) => {
            for(let i = index + 1; i < horizontalSegments.length; i++) {
                const segment2 = horizontalSegments[i];
                const overlap = segment1.getOverlap(segment2, this.#overlaps);
                overage += overlap;
            }
        });

        return totalArea - overage;
    }

    fixInstructions() {
        this.#instructions.forEach(instruction => instruction.fix());
        this.#processInstructions();
    }

    printLineSegments() {
        const lines = this.#lineSegments.map((line) => line.toString());

        const log = '\r\n' + lines.join('\r\n');
        stopwatch.timelog(log);
    }

    saveSvg(fileName, scale) {
        const width = this.#width * scale * 1.2;
        const height = this.#height * scale;
        const translateY = this.#horizontalSplits.getNumbers().at(0) * -1;
        const translateX = this.#verticalSplits.getNumbers().at(0) * -1;

        let svg = `<svg version="1.1" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        const transform = `scale(${scale} ${scale}) translate(${translateX} ${translateY})`;
        const points = [];
        points.push(this.#lineSegments[0].getPoint1().toString());

        const endPoints = this.#lineSegments.map((line) => { return line.getPoint2().toString(); });
        points.push(...endPoints)

        const pointString = points.join(' ');

        svg += `\r\n  <polygon transform="${transform}" points="${pointString}" />`
        svg += '\r\n</svg>'

        writefile(fileName, svg);
    }

    saveSquaresSvg(filename, scale) {
        const width = this.#width * scale * 1.2;
        const height = this.#height * scale;
        const translateY = this.#horizontalSplits.getNumbers().at(0) * -1;
        const translateX = this.#verticalSplits.getNumbers().at(0) * -1;

        let svg = `<svg version="1.1" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        const transform = `scale(${scale} ${scale}) translate(${translateX} ${translateY})`;

        const colors = [
            'black',
            'blue',
            'red',
            'yellow',
            'grey',
            'green',
            'aqua',
            'burlywood',
            'coral',
            'darkolivegreen'
        ];
        this.#squares.forEach((square, index) => {
            const x1 = Math.min(square.point1.getCol(), square.point2.getCol());
            const y1 = Math.min(square.point1.getRow(), square.point2.getRow());
            const x2 = Math.max(square.point1.getCol(), square.point2.getCol());
            const y2 = Math.max(square.point1.getRow(), square.point2.getRow());
            const width = x2 - x1;
            const height = y2 - y1;
            const color = colors[index % colors.length];

            svg += `\r\n  <rect x="${x1}" y="${y1}" width="${width}" height="${height}" fill="${color}" transform="${transform}"/>`

        });
        svg += '\r\n</svg>'

        writefile(filename, svg);
    }

    saveDebugInfo(filename) {
        let csvLines = [];

        csvLines.push('Line Segments');
        const lineSegments = this.#lineSegments.map((line) => line.toString());
        csvLines.push(...lineSegments);

        csvLines.push('Squares');
        const squares = this.#squares.map((square) => {
            const point1 = square.point1.toString();
            const point2 = square.point2.toString();
            return `${point1},${point2},${square.area}`;
        });
        csvLines.push(...squares);

        csvLines.push('Overlaps');
        const overlaps = this.#overlaps.map((overlap) => {
            return overlap.toString();
        });
        csvLines.push(...overlaps);
        
        const csvString = csvLines.join('\r\n');
        writefile(filename, csvString);
    }

    #processInstructions() {
        stopwatch.timelog('Building line segments...');
        let currentPosition = new Position(0, 0);
        this.#lineSegments = [];
        this.#horizontalSplits.clear();
        this.#verticalSplits.clear();

        this.#instructions.forEach((instruction) => {
            this.#horizontalSplits.addNumber(currentPosition.getRow());
            this.#verticalSplits.addNumber(currentPosition.getCol());

            let nextPosition = currentPosition.moveDirection(instruction.getDirection(), instruction.getLength());
            const lineSegment = new LineSegment(currentPosition, nextPosition);
            this.#lineSegments.push(lineSegment);

            currentPosition = nextPosition;
        });

        const horizontalPoints = this.#horizontalSplits.getNumbers();
        const verticalPoints = this.#verticalSplits.getNumbers();
        this.#width = horizontalPoints.at(-1) - horizontalPoints.at(0);
        this.#height = verticalPoints.at(-1) - verticalPoints.at(0);

    }

    #findIntersections(y) {
        const intersections = [];

        this.#lineSegments.forEach((line) => {
            // We don't care about horizontal lines
            if (line.isHorizontal()) return;

            if (line.getMinY() <= y && line.getMaxY() > y) {
                intersections.push(line.getPoint1().getCol());
            }
        });
        
        const sortedIntersections = intersections.sort((a, b) => { return Number(a) - Number(b); });
        return sortedIntersections;
    }
}

class Instruction {
    #direction = null;
    #length = null;
    #color = null;

    constructor(line) {
        const regex = /(\w) (\d+) \((.*)\)/;
        const matches = regex.exec(line);
        this.#direction = matches[1];
        this.#length = Number(matches[2]);
        this.#color = matches[3];
    }

    getDirection() { return this.#direction; }
    getLength() { return this.#length; }
    getColor() { return this.#color; }

    fix() {
        this.#length = Number('0x' + this.#color.slice(1, 6));
        this.#direction = this.#getDirection(this.#color.slice(-1));
    }

    #getDirection(num) {
        switch(num) {
            case '0': return 'R';
            case '1': return 'D';
            case '2': return 'L';
            case '3': return 'U';
            default: throw `Invalid direction ${num}`;
        }
    }
}

class LineSegment {
    #point1 = null;
    #point2 = null;

    constructor(point1, point2) {
        this.#point1 = point1;
        this.#point2 = point2;
    }

    getPoint1() { return this.#point1; }
    getPoint2() { return this.#point2; }

    isHorizontal() { return this.#point1.getRow() === this.#point2.getRow(); }
    isVertical() { return this.#point1.getCol() === this.#point2.getCol(); }

    getMinY() { return Math.min(this.#point1.getRow(), this.#point2.getRow()); }
    getMaxY() { return Math.max(this.#point1.getRow(), this.#point2.getRow()); }
    getMinX() { return Math.min(this.#point1.getCol(), this.#point2.getCol()); }
    getMaxX() { return Math.max(this.#point1.getCol(), this.#point2.getCol()); }

    getOverlap(lineSegment, overlapList) {
        if (!lineSegment.isHorizontal() || !this.isHorizontal()) return 0;
        if (lineSegment.getMinY() !== this.getMinY()) return 0;

        const hasOverlap = this.getMinX() <= lineSegment.getMaxX() && this.getMaxX() >= lineSegment.getMinX();

        if (!hasOverlap) return 0;

        const points = [ 
            this.getMinX(), 
            lineSegment.getMinX(),
            this.getMaxX(),
            lineSegment.getMaxX()
        ].sort((a, b) => Number(a) - Number(b));

        const overlap = points[2] - points[1] + 1;

        const segment = new LineSegment(new Position(this.getMinY(), points[1]), new Position(this.getMinY(), points[2]));
        overlapList.push(segment);

        return overlap; 
    }

    toString() {
        return `${this.#point1.getCol()}, ${this.#point1.getRow()}, ${this.#point2.getCol()}, ${this.#point2.getRow()}`;
    }
}