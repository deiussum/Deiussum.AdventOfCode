const readfile = require('./readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

const totals = {
    red: 12,
    green: 13,
    blue: 14
};

readfile.readfile(INPUT, (lines) => {
    let total = 0;
    let powerTotal = 0;

    lines.forEach((line) => {
        // console.log(line);
        const game = new Game(line);

        if (game.isValid(totals.red, totals.green, totals.blue)) {
            console.log(`Valid: ${game.toString()}`);
            total += game.getValue();
        }
        else {
            console.log(`Invalid: ${game.toString()}`);
        }
        powerTotal += game.getPower();
    });
    console.log(`Total is ${total}`);
    console.log(`Total power is ${powerTotal}`);
});

class Hand {
    #red = 0;
    #blue = 0;
    #green = 0;

    constructor(input) {
        this.#red = this.#getColorCount(input, 'red');
        this.#blue = this.#getColorCount(input, 'blue');
        this.#green = this.#getColorCount(input, 'green');
    }

    #getColorCount(input, color) {
        const regEx = new RegExp(`(\\d+) ${color}`);
        const matches = regEx.exec(input);

        if (!matches) return 0;

        return Number(matches[1]);
    }

    isValid(red, green, blue) {
        const valid = red >= this.#red && green >= this.#green && blue >= this.#blue;
        return valid;
    }

    getColors() {
        return {
            red: this.#red,
            blue: this.#blue,
            green: this.#green
        };
    }

    toString() {
        return `${this.#red} Red, ${this.#green} Green,  ${this.#blue} Blue`;
    }
}

class Game {
    #id = 0;
    #hands = [];

    constructor(line) {
        this.#getId(line);

        const handsIndex = line.indexOf(':');
        const handsInput = line.slice(handsIndex);
        const hands = handsInput.split(';');

        hands.forEach((handInput) => {
            this.#hands.push(new Hand(handInput));
        });
    }

    isValid(red, green, blue) {
        const tests = this.#hands.map((hand) => hand.isValid(red, green, blue));

        const valid = tests.indexOf(false);

        return valid < 0;
    }

    getValue() { return this.#id; }

    getPower() {
        const minimums = this.#getMinimums();
        return minimums.red * minimums.green * minimums.blue;
    }

    toString() {
        const handStrings = this.#hands.map((hand) => hand.toString());
        const combinedHands = handStrings.join(';')
        return `Game ${this.#id}: ${combinedHands}`;
    }

    #getId(line) {
        const matches = /^Game (\d+):/.exec(line);
        if (!matches) {
            console.log(`Invalid input: ${line}`);
            return;
        }

        this.#id = Number(matches[1]);
    }

    #getMinimums() {
        const minimums = {
            red: 0,
            green: 0,
            blue: 0
        };

        this.#hands.forEach((hand) => {
            const handColors = hand.getColors();
            minimums.red = minimums.red > handColors.red ? minimums.red : handColors.red;
            minimums.green = minimums.green > handColors.green ? minimums.green : handColors.green;
            minimums.blue = minimums.blue > handColors.blue ? minimums.blue : handColors.blue;
        });

        return minimums;
    }

}