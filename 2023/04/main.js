const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    let total = 0;
    lines.forEach((line) => {
        const card = new Card(line);
        const score = card.getScore();
        const cardNumber = card.getCardNumber();

        total += score;

        console.log(`Card: ${cardNumber}, Score: ${score}`)
    });

    console.log(`Total score: ${total}`)
});

class Card {
    #cardNumber = null;
    #winningNumbers = [];
    #playedNumbers = [];

    constructor(line) {
        this.#parseCardNumber(line);
        this.#parseWinningNumbers(line);
        this.#parsePlayedNumbers(line);
    }

    getCardNumber() { return this.#cardNumber; }

    getMatchingNumbers() {
        return this.#winningNumbers.filter((num) => this.#playedNumbers.indexOf(num) >= 0);
    }

    getScore() {
        const matches = this.getMatchingNumbers();
        return matches.length === 0 ? 0 : 2 ** (matches.length - 1);
    }

    #parseCardNumber(line) {
        const regex = /Card *(\d+)/;
        const matches = regex.exec(line);
        this.#cardNumber = Number(matches[1]);
    }

    #parseWinningNumbers(line) {
        const colonIndex = line.indexOf(':');
        const pipeIndex = line.indexOf('|');
        const numberList = line.slice(colonIndex+1, pipeIndex - 1);

        this.#winningNumbers = this.#parseNumberList(numberList);
    }

    #parsePlayedNumbers(line) {
        const pipeIndex = line.indexOf('|');
        const numberList = line.slice(pipeIndex+1);

        this.#playedNumbers = this.#parseNumberList(numberList);
    }

    #parseNumberList(list) {
        const numberSplit = list.trim().split(' ');
        const numbers = [];

        numberSplit.forEach((number) => {
            if (number === '') return;
            numbers.push(Number(number));
        });

        return numbers;
    }
}