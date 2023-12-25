
class Position {
    #row = 0;
    #col = 0;

    constructor(row, col) {
        this.#row = Number(row);
        this.#col = Number(col);
    }

    getRow() { return this.#row; }
    getCol() { return this.#col; }
    getX() { return this.#col; }
    getY() { return this.#row; }

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

class Position3d {
    #x = 0;
    #y = 0;
    #z = 0;

    constructor(x, y, z) {
        this.#x = Number(x);
        this.#y = Number(y);
        this.#z = Number(z);
    }

    getX() { return this.#x; }
    getY() { return this.#y; }
    getZ() { return this.#z; }

    translate(x, y, z) {
        this.#x += x;
        this.#y += y;
        this.#z += z;
    }

    toString() {
        return `${this.#x},${this.#y},${this.#z}`;
    }
}
exports.Position3d = Position3d;

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

    addRange(numbers) {
        numbers.forEach((number) => this.addNumber(number));
    }

    hasNumber(number) {
        return this.#numbers.indexOf(number) >= 0;
    }

    clear() {
        this.#numbers = [];
    }
}

exports.NumberSet = NumberSet;

class Vector3d {
    #position = null;
    #velocity = null;

    constructor(position, velocity) {
        this.#position = position;
        this.#velocity = velocity;
    }

    flattenXY() {
        const pos2d = new Position(this.#position.getY(), this.#position.getX());
        const dir2d = new Position(this.#velocity.getY(), this.#velocity.getX());

        return new Vector2d(pos2d, dir2d);
    }
}

exports.Vector3d = Vector3d;

class Vector2d {
    #position = null;
    #velocity = null;

    constructor(pos, vel) {
        this.#position = pos;
        this.#velocity = vel;
    }

    getPosition() { return this.#position; }
    getVelocity() { return this.#velocity; }

    getSlope() { 
        if (this.#velocity.getCol() === 0) return null;

        return this.#velocity.getRow() / this.#velocity.getCol();  
    }

    getIntercept() {
        const slope = this.getSlope();
        if (slope === null) return null;

        return this.#position.getRow() - slope * this.#position.getCol();
    }

    intersection(other) {
        const thisSlope = this.getSlope();
        const thisIntercept = this.getIntercept();
        const otherSlope = other.getSlope();
        const otherIntercept = other.getIntercept();

        // Parallel lines, will never intersect
        if (thisSlope === otherSlope && thisIntercept !== otherIntercept) return null; 

        // Same line, but possibly different speed vector to check return null for now and come back to this.
        if (thisSlope === otherSlope) {
            return null;
        }

        // Handle when one line or the other is vertical (will have a null slope)
        if (otherSlope === null) {
            const xIntersection = other.getPosition().getCol();
            const yIntersection = thisSlope * xIntersection * thisIntercept;

            return new Position(yIntersection, xIntersection);
        }
        else if (thisSlope === null) {
            const xIntersection = this.#position.getCol();
            const yIntersection = otherSlope * xIntersection * otherIntercept;

            return new Position(yIntersection, xIntersection);
        }

        const xIntersection = (thisIntercept - otherIntercept) / (otherSlope - thisSlope);
        const yIntersection = thisSlope * xIntersection + thisIntercept;

        return new Position(yIntersection, xIntersection);
    }

    isHeadingTowards(pos) {
        const xDir = pos.getX() - this.#position.getX();
        const yDir = pos.getY() - this.#position.getY();
        const xSameDir = (xDir <= 0 && this.#velocity.getX() <= 0) || (xDir >= 0 && this.#velocity.getX() >= 0);
        const ySameDir = (yDir <= 0 && this.#velocity.getY() <= 0) || (yDir >= 0 && this.#velocity.getY() >= 0);

        return xSameDir && ySameDir;
    }
}