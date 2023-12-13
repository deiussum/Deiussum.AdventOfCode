const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    stopwatch.start();

    let map = new MirrorMap();
    let part1Total = 0;
    lines.forEach((line) => {
        if (line === '') {
            map.findMirror();
            part1Total += map.getValue();
            map = new MirrorMap();
        }
        else {
            map.addRow(line);
        }

    });
    map.findMirror();
    part1Total += map.getValue();

    console.log(`Part 1 total: ${part1Total}`);
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

    getValue() {
        if (this.#mirrorCol) return Math.ceil(this.#mirrorCol);
        if (this.#mirrorRow) return 100 * Math.ceil(this.#mirrorRow);
        return 0;
    }

    #calculateColumns() {
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
}