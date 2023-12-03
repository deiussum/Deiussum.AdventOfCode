const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';


readfile.readfile(INPUT, (lines) => {
    const engine = new Engine();

    lines.forEach((line) => {
        engine.addRow(line);
    });

    const sumOfPartNumbers = engine.getSumOfPartNumbers()
    const sumOfGearRatios = engine.getSumOfGearRatios()

    console.log(`Sum of part numbers is: ${sumOfPartNumbers}`);
    console.log(`Sum of gear ratios is: ${sumOfGearRatios}`);
});

class EngineRow {
    #numbers = [];
    #symbols = [];

    constructor(line) {
        let currentNumberString = '';
        let numberIndex = 0;

        for(let i=0; i<line.length; i++) {
            const character = line[i];
            if (this.#isDigit(character)) {
                if (currentNumberString === '') numberIndex = i;
                currentNumberString += character;
                continue;
            }

            if (currentNumberString !== '') {
                this.#addNumber(currentNumberString, numberIndex);
                currentNumberString = '';
            }

            if (this.#isSymbol(character)) {
                this.#addSymbol(character, i);
            }
        }

        // Make sure to add any numbers hanging out at the end of a line
        if (currentNumberString !== '') this.#addNumber(currentNumberString, numberIndex);
    }

    getNumbers() { return this.#numbers; }
    getSymbols() { return this.#symbols; }

    hasSymbol(startIndex, endIndex) {
        if (endIndex === undefined) endIndex = startIndex;
        const symbolTests = this.#symbols.map((symbol) => symbol.index >= startIndex && symbol.index <= endIndex);
        return symbolTests.indexOf(true) >= 0;
    }

    getNumbersInRange(startIndex, endIndex) {
        const numbers = [];
        if (endIndex === undefined) endIndex = startIndex;
        
        this.#numbers.forEach((number) => {
            if (number.index <= endIndex && number.index + number.length - 1 >= startIndex) {
                numbers.push(number);
            }
        });

        return numbers;
    }

    #addNumber(numberString, numberIndex) {
        this.#numbers.push({
            number: Number(numberString),
            index: numberIndex,
            length: numberString.length
        });
    }

    #addSymbol(symbol, symbolIndex) {
        this.#symbols.push({
            symbol: symbol,
            index: symbolIndex
        });
    }

    #isDigit(character) {
        const regex = /\d/;
        return regex.test(character);
    }

    #isSymbol(character) {
        const regex = /[^0-9\.]/
        return regex.test(character);
    }
}

class Engine {
    #rows = [];

    addRow(line) {
        this.#rows.push(new EngineRow(line));
    }

    getSumOfPartNumbers() {
        let total=0;

        for(let rowIndex=0; rowIndex<this.#rows.length; rowIndex++) {
            const currentRow = this.#rows[rowIndex];
            const previousRow = rowIndex > 0 ? this.#rows[rowIndex - 1] : null;
            const nextRow = rowIndex < this.#rows.length ? this.#rows[rowIndex + 1]: null;
            const numbers = this.#rows[rowIndex].getNumbers();

            if (!numbers) continue;

            for(let numberIndex=0; numberIndex<numbers.length; numberIndex++) {
                const number = numbers[numberIndex];
                const startIndex = number.index - 1;
                const endIndex = number.index + number.length;

                if (previousRow && previousRow.hasSymbol(startIndex, endIndex)) {
                    total += number.number;
                    console.log(`Row: ${rowIndex}, Number: ${number.number}, Symbols on previous line`);
                    continue;
                }

                if (currentRow.hasSymbol(startIndex) || currentRow.hasSymbol(endIndex)) {
                    total += number.number;
                    console.log(`Row: ${rowIndex}, Number: ${number.number}, Symbols on same line`);
                    continue;
                }

                if (nextRow && nextRow.hasSymbol(startIndex, endIndex)) {
                    total += number.number;
                    console.log(`Row: ${rowIndex}, Number: ${number.number}, Symbols on next line`);
                    continue;
                }

                console.log(`Row: ${rowIndex}, Number: ${number.number}, No adjacent symbols`);
            }
        }

        return total;
    }

    getGears() {
        const gears = [];

        for(let rowIndex=0; rowIndex<this.#rows.length; rowIndex++) {
            const currentRow = this.#rows[rowIndex];
            const previousRow = rowIndex > 0 ? this.#rows[rowIndex - 1] : null;
            const nextRow = rowIndex < this.#rows.length ? this.#rows[rowIndex + 1]: null;
            const symbols = this.#rows[rowIndex].getSymbols();

            if (!symbols) continue;

            for(let symbolIndex=0; symbolIndex<symbols.length; symbolIndex++) {
                const symbol = symbols[symbolIndex];
                const startIndex = symbol.index - 1;
                const endIndex = symbol.index + 1;

                let allAdjacentNumbers = [];

                if (symbol.symbol !== '*') continue;

                if (previousRow) {
                    const adjacentNumbers = previousRow.getNumbersInRange(startIndex, endIndex);
                    if (adjacentNumbers && adjacentNumbers.length > 0) {
                        adjacentNumbers.forEach((number) => {
                            allAdjacentNumbers.push(number);
                        })
                    }
                }

                const priorAdjacentNumber = currentRow.getNumbersInRange(startIndex);
                if (priorAdjacentNumber && priorAdjacentNumber.length > 0) {
                    allAdjacentNumbers.push(priorAdjacentNumber[0]);
                }
                const nextAdjacentNumber = currentRow.getNumbersInRange(endIndex);
                if (nextAdjacentNumber && nextAdjacentNumber.length > 0) {
                    allAdjacentNumbers.push(nextAdjacentNumber[0]);
                }

                if (nextRow) {
                    const adjacentNumbers = nextRow.getNumbersInRange(startIndex, endIndex);
                    if (adjacentNumbers && adjacentNumbers.length > 0) {
                        adjacentNumbers.forEach((number) => {
                            allAdjacentNumbers.push(number);
                        })
                    }
                }

                if (allAdjacentNumbers.length != 2) continue;

                const gear = {
                    number1: allAdjacentNumbers[0].number,
                    number2: allAdjacentNumbers[1].number,
                    gearRatio: allAdjacentNumbers[0].number * allAdjacentNumbers[1].number
                };

                gears.push(gear);

                console.log(`Gear found - Row:${rowIndex}, Column:${symbol.index}, Number1:${gear.number1}, Number2:${gear.number2}, Ratio:${gear.gearRatio} `);
            }
        }

        return gears;
    }

    getSumOfGearRatios() {
        const gears = this.getGears();

        let total = 0;
        gears.forEach((gear) => total += gear.gearRatio);

        return total;
    }
}