
class Stopwatch {
    #startTime = null;

    start() {
        this.#startTime = new Date();
        console.log(`Starting at ${this.#startTime}`);
    }

    stop() {
        const endTime = new Date();
        const elapsed = endTime - this.#startTime;

        console.log(`Ending at ${endTime} - ${elapsed}ms`);
        return elapsed;
    }
}

const stopwatch = new Stopwatch();

exports.start = () => stopwatch.start(); 
exports.stop = () => stopwatch.stop(); 