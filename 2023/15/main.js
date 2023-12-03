const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(TEST_INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    lines.forEach((line) => {
        console.log(line);
    });
});
