const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const workflows = new WorkflowEngine();
    const parts = [];
    let blankFound = false;
    lines.forEach((line) => {
        if (line === '') {
            blankFound = true;
            return;
        }
        if (!blankFound) {
            workflows.addWorkflow(new Workflow(line));
        }
        else {
            parts.push(new Part(line));
        }
    });

    parts.forEach((part) => workflows.processPart(part));

    const acceptedCount = workflows.getAcceptedCount();
    const part1Total = parts.reduce((total, part) => total + part.getValue(), 0);
    stopwatch.timelog(`Part 1 total: ${part1Total}, ${acceptedCount} parts accepted.`);


    stopwatch.stop();
});

class WorkflowEngine {
    #workflows = [];
    #acceptedCount = 0;

    getAcceptedCount() { return this.#acceptedCount; }

    addWorkflow(workflow) {
        this.#workflows.push(workflow);
    }

    processPart(part) { 
        let workflow = this.getWorkflow('in');
        let continueProcessing = true;

        while(continueProcessing) {
            const result = workflow.processPart(part);
            if (result === 'A') {
                part.accept();
                continueProcessing = false;
                this.#acceptedCount++;
            }
            else if (result === 'R') {
                continueProcessing = false;
            }
            else {
                workflow = this.getWorkflow(result);
            }
        }
    }

    getWorkflow(name) { 
        const workflow = this.#workflows.find((workflow) => workflow.getName() === name);

        if (!workflow) {
            throw `Invalid workflow: ${name}`;
        }

        return workflow;
    }
}

class Workflow {
    #name = null;
    #steps = [];

    constructor(input) {
        const regex = /([a-z]+)\{(.*)\}/;
        const matches = input.match(regex);

        this.#name = matches[1];
        this.#steps = matches[2].split(',').map((step) => new WorflowStep(step));
    }

    getName() { return this.#name; }

    processPart(part) {
        let result = null;
        for(let i = 0; i < this.#steps.length; i++) {
            const step = this.#steps[i];
            const stepResult = step.processPart(part);
            if (stepResult) {
                result = stepResult;
                break;
            }
        }
        return result;
    }
}

class WorflowStep {
    #test = null;
    #trueResult = null;

    constructor(input) {
        const parts = input.split(':');
        if (parts.length === 1) {
            this.#test = null;
            this.#trueResult = input;
        }
        else {
            this.#test = new WorkflowTest(parts[0]);
            this.#trueResult = parts[1];
        }
    }

    processPart(part) {
        if (!this.#test) return this.#trueResult;

        return this.#test.testPart(part) ? this.#trueResult : null;
    }
}

class WorkflowTest {
    #variable = null;
    #operator = null;
    #value = null;

    constructor(input) {
        const regex = /([a-z]+)([<>])(\d+)/;
        const matches = input.match(regex);

        this.#variable = matches[1];
        this.#operator = matches[2];
        this.#value = matches[3];
    }

    testPart(part) {
        const partValue = part.getVariable(this.#variable);
        switch(this.#operator) {
            case '<': return partValue < this.#value;
            case '>': return partValue > this.#value;
            default: throw `Invalid operator: ${this.#operator}`;
        }
    }
}

class Part {
    #x = null;
    #m = null;
    #a = null;
    #s = null;
    #accepted = false;

    constructor(input) {
        const regex = /\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}/;
        const matches = input.match(regex);

        this.#x = Number(matches[1]);
        this.#m = Number(matches[2]);
        this.#a = Number(matches[3]);
        this.#s = Number(matches[4]);
    }

    getX() { return this.#x; }
    getM() { return this.#m; }
    getA() { return this.#a; }
    getS() { return this.#s; }
    getAccepted() { return this.#accepted; }

    accept() { this.#accepted = true; }

    getVariable(variable) {
        switch(variable) {
            case 'x': return this.#x;
            case 'm': return this.#m;
            case 'a': return this.#a;
            case 's': return this.#s;
            default: throw `Invalid variable: ${variable}`;
        }
    }

    getValue() {
        if (!this.#accepted) return 0;
        return this.#x + this.#m + this.#a + this.#s;
    }

}