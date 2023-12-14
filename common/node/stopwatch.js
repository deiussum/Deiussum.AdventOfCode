
class Stopwatch {
    #startTime = null;

    start() {
        this.#startTime = new Date();
        this.timelog('Starting...')
    }

    stop() {
        const endTime = new Date();
        const elapsed = endTime - this.#startTime;
        this.timelog('Stopped.');
        return elapsed;
    }

    timelog(msg) {
        const curTime = new Date();
        const elapsed = curTime - this.#startTime;
        const dateString = this.formatDate(curTime)
        const elapsedString = this.elapsedMillisecondsToString(elapsed);

        console.log(`${dateString} (${elapsedString}) - ${msg}`);
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = this.padLeft('0', date.getMonth() + 1, 2);
        const day = this.padLeft('0', date.getDate(), 2);
        const hours = this.padLeft('0', date.getHours(), 2);
        const mins = this.padLeft('0', date.getMinutes(), 2);
        const secs = this.padLeft('0', date.getSeconds(), 2);
        const ms = this.padLeft('0', date.getMilliseconds(), 3);
        return `${year}-${month}-${day} ${hours}:${mins}:${secs}.${ms}`;
    }

    padLeft(char, number, padSize) {
        return (char.repeat(padSize) + number.toString()).slice(-padSize);
    }

    elapsedMillisecondsToString(ms) {
        const days = Math.floor(ms / MS_PER_DAY);
        let remaining = ms - days * MS_PER_DAY;

        const hrs = Math.floor(remaining / MS_PER_HR);
        remaining -= hrs * MS_PER_HR;

        const mins = Math.floor(remaining / MS_PER_MIN);
        remaining -= mins * MS_PER_MIN;

        const secs = Math.floor(remaining / MS_PER_SEC);
        remaining -= secs * MS_PER_SEC;

        const parts = [];

        if (days > 0) parts.push(`${days}d`);
        if (hrs > 0) parts.push(`${hrs}h`);
        if (mins > 0) parts.push(`${mins}m`);
        if (secs > 0) parts.push(`${secs}s`);
        parts.push(`${remaining}ms`);

        return parts.join(' ');
    }
}

const MS_PER_SEC = 1000;
const MS_PER_MIN = 60 * MS_PER_SEC;
const MS_PER_HR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HR;

const stopwatch = new Stopwatch();

exports.start = () => stopwatch.start(); 
exports.stop = () => stopwatch.stop(); 
exports.timelog = (msg) => stopwatch.timelog(msg);