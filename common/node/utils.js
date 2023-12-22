
class Position {
    #row = 0;
    #col = 0;

    constructor(row, col) {
        this.#row = Number(row);
        this.#col = Number(col);
    }

    getRow() { return this.#row; }
    getCol() { return this.#col; }

    equals(pos) {
        return this.#row === pos.getRow() && this.#col === pos.getCol();
    }

    distance(pos) {
        return Math.abs(pos.getRow() - this.#row) + Math.abs(pos.getCol() - this.#col);
    }

    moveDirection(direction, length) {
        let row = this.#row;
        let col = this.#col;
        let move = (!length) ? 1 : length;

        switch(direction) {
            case 'N': 
            case 'U':
                row-=move;
                break;
            case 'S': 
            case 'D':
                row+=move;
                break;
            case 'W': 
            case 'L':
                col-=move;
                break;
            case 'E': 
            case 'R':
                col+=move;
                break;
            default: throw `Invalid direction: ${direction}`
        }

        return new Position(row, col);
    }

    toString() {
        return `${this.#col},${this.#row}`;
    }
}

exports.Position = Position;

class Cache {
    #cache = [];

    cache(key, val) {
        const cacheItem = { ...key, value: val };
        this.#cache.push();
        return val;
    }

    find(findKey) {
        const item = this.#cache.find(findKey);
        return item;
    }
}

exports.Cache = Cache;

class NumberSet {
    #numbers = [];

    getNumbers() { return [ ...this.#numbers ]; }

    addNumber(number) {
        if (!this.hasNumber(number)) {
            this.#numbers.push(number);
            this.#numbers = this.#numbers.sort((a, b) => { return Number(a) - Number(b) });
        }
    }

    hasNumber(number) {
        return this.#numbers.indexOf(number) >= 0;
    }

    clear() {
        this.#numbers = [];
    }
}

exports.NumberSet = NumberSet;