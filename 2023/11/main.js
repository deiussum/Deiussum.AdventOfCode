const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    const startTime = new Date();
    console.log(`Starting at ${startTime}`);

    const galaxyMap = new GalaxyMap();
    lines.forEach((line) => {
        galaxyMap.addLine(line);
    });

    const part1 = galaxyMap.getPart1();
    console.log(`Part 1: ${part1}`);

    const endTime = new Date();
    const elapsed = endTime - startTime;
    console.log(`Completed at ${endTime}: ${elapsed}ms`);
});

class GalaxyMap {
    #lines = [];
    #galaxies = [];
    #emptyRows = [];
    #emptyCols = [];

    addLine(line) {
        const lineIndex = this.#lines.length;
        this.#lines.push(line);

        if (lineIndex === 0) {
            for (let i = 0; i < line.length; i++) {
                this.#emptyCols.push(i);
            }
        }

        let galaxyIndex = line.indexOf('#');
        let galaxyCount = 0;
        while(galaxyIndex >= 0) {
            const galaxy = { row: lineIndex, col: galaxyIndex };

            this.#galaxies.push(galaxy);
            galaxyIndex = line.indexOf('#', galaxyIndex + 1);
            galaxyCount++;

            const colIndex = this.#emptyCols.indexOf(galaxy.col);
            if (colIndex >= 0) {
                this.#emptyCols.splice(colIndex, 1);
            }
        }

        if (galaxyCount === 0) {
            this.#emptyRows.push(lineIndex);
        }
    }

    getPart1() {    
        let total = 0;
        for (let i = 0; i < this.#galaxies.length - 1; i++) {
            const galaxy1 = this.#galaxies[i];
            for (let j = i + 1; j < this.#galaxies.length; j++) {
                const galaxy2 = this.#galaxies[j];

                const dist = this.getDistance(galaxy1, galaxy2);

                console.log(`Distance between galaxy ${i+1} (${galaxy1.row},${galaxy1.col}) and galaxy ${j+1}(${galaxy2.row},${galaxy2.col}) is ${dist}`);
                total += dist;
            }
        }
        return total;
    }

    getDistance(galaxy1, galaxy2) {
        const nonExpandedDistance = Math.abs(galaxy1.row - galaxy2.row) + Math.abs(galaxy1.col - galaxy2.col);
        const emptyRows = this.getEmptyRows(galaxy1.row, galaxy2.row);
        const emptyCols = this.getEmptyCols(galaxy1.col, galaxy2.col);

        return nonExpandedDistance + emptyRows + emptyCols;
    }

    getEmptyRows(startIndex, endIndex) {
        let emptyRows = 0;
        for (let i = startIndex + 1; i < endIndex; i++) {
            if (this.#emptyRows.indexOf(i) >= 0) emptyRows++;
        }

        return emptyRows;
    }

    getEmptyCols(startIndex, endIndex) {
        let emptyCols = 0;
        for (let i = Math.min(startIndex, endIndex); i < Math.max(startIndex, endIndex); i++) {
            if (this.#emptyCols.indexOf(i) >= 0) emptyCols++;
        }

        return emptyCols;
    }
}