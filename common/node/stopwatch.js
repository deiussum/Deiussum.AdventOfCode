const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

class Stopwatch {
    #startTime = null;

    start() {
        this.#startTime = dayjs();
        this.timelog('Starting...')
    }

    stop() {
        const endTime = dayjs();
        const elapsed = endTime.diff(this.#startTime);
        this.timelog('Stopped.');
        return elapsed;
    }

    timelog(msg) {
        const curTime = dayjs();
        const elapsed = curTime.diff(this.#startTime);
        const dateString = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
        const elapsedString = this.elapsedMillisecondsToString(elapsed);

        console.log(`${dateString} (${elapsedString}) - ${msg}`);
    }

    startPeriodicLog(seconds) {
        return {
            start: dayjs(),
            everyXseconds: seconds,
            nextlog: seconds 
        };
    }

    periodiclog(period, message) {
        const diff = dayjs().diff(period.start);
        const duration = dayjs.duration(diff);
        const elapsed = duration.asSeconds();
        const log = period.nextlog <= elapsed;
        if (log) {
            this.timelog(message);
            period.nextlog = elapsed + period.everyXseconds;
        }
    }


    padLeft(char, number, padSize) {
        return (char.repeat(padSize) + number.toString()).slice(-padSize);
    }

    elapsedMillisecondsToString(diff) {
        const elapsed = dayjs.duration(diff);

        const days = elapsed.days();
        const hrs = elapsed.hours();
        const mins = elapsed.minutes();
        const secs = elapsed.seconds();
        const ms = elapsed.milliseconds();

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hrs > 0) parts.push(`${hrs}h`);
        if (mins > 0) parts.push(`${mins}m`);
        if (secs > 0) parts.push(`${secs}s`);
        parts.push(`${ms}ms`);

        return parts.join(' ');
    }
}


const stopwatch = new Stopwatch();

exports.start = () => stopwatch.start(); 
exports.stop = () => stopwatch.stop(); 
exports.timelog = (msg) => stopwatch.timelog(msg);
exports.startPeriodicLog = (seconds) => stopwatch.startPeriodicLog(seconds);
exports.periodicLog = (period, message) => stopwatch.periodiclog(period, message);