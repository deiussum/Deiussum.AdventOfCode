const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    let totalScore = 0;
    const cards = []
    lines.forEach((line) => {
        const card = new Card(line);
        const score = card.getScore();
        const cardNumber = card.getCardNumber();

        totalScore += score;

        cards.push(card);

        stopwatch.timelog(`Card: ${cardNumber}, Score: ${score}`)
    });

    let totalCards = 0;
    cards.forEach((card, index) => {
        const matches = card.getMatchingNumbers();
        const matchCount = matches.length;
        const instanceCount = card.getInstancCount();

        totalCards += instanceCount;

        for(let i = 1; i <= matchCount; i++) {
            if (index + i > cards.length) return;
            cards[index + i].incrementInstance(instanceCount);
        }
    });

    stopwatch.timelog(`Total score: ${totalScore}`);
    stopwatch.timelog(`Total cards: ${totalCards}`);
    stopwatch.stop();
});

class Card {
    #cardNumber = null;
    #winningNumbers = [];
    #playedNumbers = [];
    #instanceCount = 1;

    constructor(line) {
        this.#parseCardNumber(line);
        this.#parseWinningNumbers(line);
        this.#parsePlayedNumbers(line);
    }

    getCardNumber() { return this.#cardNumber; }
    getInstancCount() { return this.#instanceCount; }

    getMatchingNumbers() {
        return this.#winningNumbers.filter((num) => this.#playedNumbers.indexOf(num) >= 0);
    }

    getScore() {
        const matches = this.getMatchingNumbers();
        return matches.length === 0 ? 0 : 2 ** (matches.length - 1);
    }

    incrementInstance(incrementAmount) {
        this.#instanceCount += incrementAmount;
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