
class Position {
    #row = 0;
    #col = 0;

    constructor(row, col) {
        this.#row = row;
        this.#col = col;
    }

    getRow() { return this.#row; }
    getCol() { return this.#col; }

    moveDirection(direction) {
        let row = this.#row;
        let col = this.#col;

        switch(direction) {
            case 'N': 
            case 'U':
                row--;
                break;
            case 'S': 
            case 'D':
                row++;
                break;
            case 'W': 
            case 'L':
                col--;
                break;
            case 'E': 
            case 'R':
                col++;
                break;
            default: throw `Invalid direction: ${direction}`
        }

        return new Position(row, col);
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