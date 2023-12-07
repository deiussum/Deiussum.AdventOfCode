const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    const hands = [];
    lines.forEach((line) => {
        const hand = new Hand(line);
        hands.push(hand);
    });

    hands.sort((x, y) => { return x.compareTo(y); });

    let part1Total = 0;
    hands.forEach((hand, index) => {
        hand.setRank(index + 1);
        console.log(hand.toString());
        part1Total += hand.getValue();
    });

    console.log(`Part 1 total: ${part1Total}`);
});

const FIVE_OF_A_KIND = 1;
const FOUR_OF_A_KIND = 2;
const FULL_HOUSE = 3;
const THREE_OF_A_KIND = 4;
const TWO_PAIR = 5;
const ONE_PAIR = 6;
const HIGH_CARD = 7;

class Hand {
    #handString = '';
    #bid = 0;
    #rank = 0;
    #cards = {
        "A": 0,
        "K": 0,
        "Q": 0,
        "J": 0,
        "T": 0,
        "9": 0,
        "8": 0,
        "7": 0,
        "6": 0,
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
    };

    constructor(line) {
        const parts = line.split(' ');
        if (parts.length !== 2) return;

        this.#handString = parts[0];
        this.#bid = Number(parts[1]);
        this.#parseIndividualCards();
    }

    compareTo(otherHand) {
        const thisHandType = this.getHandType();
        const otherHandType = otherHand.getHandType();

        if (thisHandType !== otherHandType) return thisHandType > otherHandType ? -1 : 1;

        for(let i = 0; i < 5; i++) {
            const thisHandCard = this.getCardValue(i);
            const otherHandCard = otherHand.getCardValue(i)

            if (thisHandCard === otherHandCard) continue;

            return thisHandCard < otherHandCard ? -1 : 1;
        }
        return 0;
    }

    setRank(rank) {
        this.#rank = rank;
    }

    getValue() { return this.#bid * this.#rank; }

    getHandType() {
        if (this.isFiveOfAKind()) return FIVE_OF_A_KIND;
        if (this.isFourOfAKind()) return FOUR_OF_A_KIND;
        if (this.isFullHouse()) return FULL_HOUSE;
        if (this.isThreeOfAKind()) return THREE_OF_A_KIND;
        if (this.isTwoPair()) return TWO_PAIR;
        if (this.isPair()) return ONE_PAIR;
        if (this.isHighCard()) return HIGH_CARD;

        // Should never get to this point
        throw 'Hand cannot be determined';
    }

    getCardValue(index) {
        if (index > 4 || index < 0) throw `Invalid index: ${index}`
        const card = this.#handString[index];
        
        if (card >= '2' && card <= '9') return Number(card);
        if (card === 'T') return 10;
        if (card === 'J') return 11;
        if (card === 'Q') return 12;
        if (card === 'K') return 13;
        if (card === 'A') return 14;

        throw 'Invalid card';
    }

    isFiveOfAKind() {
        return this.#hasNumberOfSameCards(5);
    }

    isFourOfAKind() {
        return this.#hasNumberOfSameCards(4);
    }

    isFullHouse() {
        return this.#hasNumberOfSameCards(3) && this.#hasNumberOfSameCards(2);
    }

    isThreeOfAKind() {
        return this.#hasNumberOfSameCards(3) && !this.#hasNumberOfSameCards(2);
    }

    isTwoPair() {
        return this.#hasExactNumberOfSameCards(2, 2);
    }

    isPair() {
        return this.#hasExactNumberOfSameCards(2, 1) && !this.#hasNumberOfSameCards(3);
    }

    isHighCard() {
        return this.#hasExactNumberOfSameCards(1, 5);
    }

    toString() {
        return `${this.#handString} - HandType: ${this.getHandType()}, Bid: ${this.#bid}, Rank: ${this.#rank}`;
    }

    #hasNumberOfSameCards(number) {
        return this.#hasExactNumberOfSameCards(number, 1);
    }

    #hasExactNumberOfSameCards(number, count) {
        let actualCount = 0;
        for(const card in this.#cards) {
           if (this.#cards[card] === number) actualCount++;
        }
        return count === actualCount;
    }

    #parseIndividualCards() {
        for(let i = 0; i < 5; i++) {
            const card = this.#handString[i];
            this.#cards[card]++;
        }
    }
}