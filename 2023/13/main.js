const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    stopwatch.start();

    let map = new MirrorMap();
    let part1Total = 0;
    let part2Total = 0;
    lines.forEach((line) => {
        if (line === '') {
            map.findMirror();
            part1Total += map.getValue();

            map.findMirrorWithSmudge();
            part2Total += map.getValue();
            map = new MirrorMap();
        }
        else {
            map.addRow(line);
        }

    });
    map.findMirror();
    part1Total += map.getValue();

    map.findMirrorWithSmudge();
    part2Total += map.getValue();

    console.log(`Part 1 total: ${part1Total}`);
    console.log(`Part 2 total: ${part2Total}`);
    stopwatch.stop();
});

class MirrorMap {
    #rows = [];
    #columns = []
    #mirrorRow = null;
    #mirrorCol = null;

    addRow(line) {
        this.#rows.push(line);
    }

    findMirror() {
        this.#mirrorRow = this.#findMirrorLine(this.#rows);

        if (!this.#mirrorRow) {
            this.#calculateColumns();
            this.#mirrorCol = this.#findMirrorLine(this.#columns);
            if (!this.#mirrorCol) throw 'No mirror found';
        }
    }

    findMirrorWithSmudge() {
        this.#mirrorRow = this.#findMirrorLineWithSmudge(this.#rows);

        if (!this.#mirrorRow) {
            this.#calculateColumns();
            this.#mirrorCol = this.#findMirrorLineWithSmudge(this.#columns);
            if (!this.#mirrorCol) throw 'No mirror found';
        }
        else {
            this.#mirrorCol = null;
        }
    }

    getValue() {
        if (this.#mirrorCol) return Math.ceil(this.#mirrorCol);
        if (this.#mirrorRow) return 100 * Math.ceil(this.#mirrorRow);
        return 0;
    }

    #calculateColumns() {
        if (this.#columns && this.#columns.length > 0) return;
        this.#rows.forEach((row, index) => {
            for(let charIndex = 0; charIndex < row.length; charIndex++) {
                const char = row[charIndex];
                if (charIndex >= this.#columns.length) {
                    this.#columns.push(char);
                }
                else {
                    this.#columns[charIndex] += char;
                }
            }
        });
    }

    #findMirrorLine(lines) {
        for(let i = 0; i < lines.length - 1; i++) {
            if (lines[i] !== lines[i + 1]) continue;
            let offset = 1;
            let mirror = true;
            while(i - offset >= 0 && i + offset + 1 < lines.length) {
                if (lines[i - offset] !== lines[i + offset + 1]) {
                    mirror = false;
                    break;
                }
                offset++;
            }
            if (mirror) return i + 0.5;
        }
        return null;
    }

    #findMirrorLineWithSmudge(lines) {
        for(let i = 0; i < lines.length - 1; i++) {
            let offset = 0;
            let mirror = true;
            let smudges = 0;
            while(i - offset >= 0 && i + offset + 1 < lines.length) {
                let smudge = this.#compareLineWithSmudge(lines[i - offset], lines[i + offset + 1]);
                smudges += smudge;
                if (smudge === -1 || smudges > 1) {
                    mirror = false;
                    break;
                }
                offset++;
            }
            if (mirror && smudges === 1) return i + 0.5;
        }
        return null;
    }

    #compareLineWithSmudge(line1, line2) {
        let differences = 0;
        for(let i = 0; i < line1.length; i++) {
            if (line1[i] !== line2[i]) differences++;
        }

        if (differences === 1) return 1;
        if (differences === 0) return 0;
        return -1;
    }
}