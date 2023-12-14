const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const hands = [];
    lines.forEach((line) => {
        const hand = new Hand(line);
        hands.push(hand);
    });

    hands.sort((x, y) => { return x.compareTo(y); });

    let part1Total = 0;
    hands.forEach((hand, index) => {
        hand.setRank(index + 1);
        stopwatch.timelog(hand.toString());
        part1Total += hand.getValue();
    });

    stopwatch.timelog(`Part 1 total: ${part1Total}`);

    // Part 2
    hands.sort((x, y) => { return x.jokerCompareTo(y); });
    let part2Total = 0;
    hands.forEach((hand, index) => {
        hand.setRank(index + 1);
        stopwatch.timelog(hand.toString(true));
        part2Total += hand.getValue();
    });
    stopwatch.timelog(`Part 2 total: ${part2Total}`);
    stopwatch.stop();
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

    jokerCompareTo(otherHand) {
        const thisHandType = this.getHandType(true);
        const otherHandType = otherHand.getHandType(true);

        if (thisHandType !== otherHandType) return thisHandType > otherHandType ? -1 : 1;

        for(let i = 0; i < 5; i++) {
            const thisHandCard = this.getCardValue(i, true);
            const otherHandCard = otherHand.getCardValue(i, true)

            if (thisHandCard === otherHandCard) continue;

            return thisHandCard < otherHandCard ? -1 : 1;
        }
        return 0;
    }

    setRank(rank) {
        this.#rank = rank;
    }

    getValue() { return this.#bid * this.#rank; }

    getHandType(allowJokers = false) {

        if (this.isFiveOfAKind(allowJokers)) return FIVE_OF_A_KIND;
        if (this.isFourOfAKind(allowJokers)) return FOUR_OF_A_KIND;
        if (this.isFullHouse(allowJokers)) return FULL_HOUSE;
        if (this.isThreeOfAKind(allowJokers)) return THREE_OF_A_KIND;
        if (this.isTwoPair(allowJokers)) return TWO_PAIR;
        if (this.isPair(allowJokers)) return ONE_PAIR;
        if (this.isHighCard(allowJokers)) return HIGH_CARD;

        // Should never get to this point
        throw 'Hand cannot be determined';
    }

    getCardValue(index, allowJokers = false) {
        if (index > 4 || index < 0) throw `Invalid index: ${index}`
        const card = this.#handString[index];
        
        if (card >= '2' && card <= '9') return Number(card);
        if (card === 'T') return 10;
        if (card === 'J') return allowJokers ? 1 : 11;
        if (card === 'Q') return 12;
        if (card === 'K') return 13;
        if (card === 'A') return 14;

        throw 'Invalid card';
    }

    isFiveOfAKind(allowJokers = false) {
        return this.#hasNumberOfSameCards(5, allowJokers);
    }

    isFourOfAKind(allowJokers = false) {
        const jokerCount = allowJokers ? this.#cards['J'] : 0;
        return (!allowJokers && this.#hasNumberOfSameCards(4, allowJokers))
            || (jokerCount === 3 && this.#hasExactNumberOfSameCards(4, 2, allowJokers))
            || (jokerCount === 2 && this.#hasExactNumberOfSameCards(4, 1, allowJokers))
            || (jokerCount === 1 && this.#hasExactNumberOfSameCards(3, 1, false))
            || (jokerCount === 0 && this.#hasExactNumberOfSameCards(4, 1, false));
    }

    isFullHouse(allowJokers = false) {
        let result = this.#hasNumberOfSameCards(3, allowJokers) && this.#hasNumberOfSameCards(2, allowJokers);

        // If we are using jokers, the only way a Joker can make a full house the best hand is if 
        // you have 2 natural pair.  If you have a natural 3 of a kind, the joker would make it a 
        // 4 of a kind.  If you have 2 jokers and a pair, you would also have 4 of a kind, etc. 
        if (!allowJokers || this.#cards['J'] !== 1) return result;

        // If we get to this point, we allow jokers and have a single joker so check for 2 natural pair
        return this.isTwoPair(false);
    }

    isThreeOfAKind(allowJokers = false) {
        let result = this.#hasNumberOfSameCards(3, allowJokers) && !this.#hasNumberOfSameCards(2, allowJokers);

        // The only valid configurations for 3 of a kind with jokers is either 1 joker and a pair, or 2 jokers
        // with no other matching cards
        const jokerCount = this.#cards['J'];
        if (!allowJokers || (jokerCount !== 1 && jokerCount !== 2)) return result;

        if (jokerCount === 1) return this.#hasExactNumberOfSameCards(2, 1, false);

        return this.#hasExactNumberOfSameCards(1, 3, false);
    }

    isTwoPair(allowJokers = false) {
        // There is no valid configuration of a Joker making two pair.  If you've already got
        // a natural pair, 1 joker would turn that into a 3 or a kind, which is better.  Same 
        // thing if you have more than 1 joker, you will already have a better hand than 2 pair
        return this.#hasExactNumberOfSameCards(2, 2, allowJokers);
    }

    isPair(allowJokers = false) {
        let result = this.#hasExactNumberOfSameCards(2, 1, allowJokers) && !this.#hasNumberOfSameCards(3, allowJokers);

        // The only valid configuration with a pair including jokers is if you have a single 
        // joker and no other matches
        if (!allowJokers || this.#cards['J'] !== 1) return result;

        // Since we're not using jokers for this test, it should have 5 distinct singles.
        result = this.#hasExactNumberOfSameCards(1, 5, false);
        return result;
    }

    isHighCard(allowJokers = false) {
        return this.#hasExactNumberOfSameCards(1, 5, allowJokers);
    }

    toString(allowJokers = false) {
        return `${this.#handString} - HandType: ${this.getHandType(allowJokers)}, Bid: ${this.#bid}, Rank: ${this.#rank}`;
    }

    #hasNumberOfSameCards(number, allowJokers = false) {
        return this.#hasExactNumberOfSameCards(number, 1, allowJokers);
    }

    #hasExactNumberOfSameCards(number, count, allowJokers = false) {
        const jokerCount = allowJokers ? this.#cards['J'] : 0;
        // Special case for 5 jokers
        if (number === 5 && jokerCount === 5) return true;

        let actualCount = 0;
        for(const card in this.#cards) {
            // If we're allowing jokers, skip them here and add them in at the end
            if (allowJokers && card === 'J') continue;

            // If there is more than 1 joker, it is always more beneficial to use them as the
            // same card, so just add them all into the count.
            if (this.#cards[card] + jokerCount === number) actualCount++;
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