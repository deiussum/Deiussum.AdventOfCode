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

    const part2Total = workflows.getAcceptableCombintionCount();
    stopwatch.timelog(`Part 2 total: ${part2Total}`);

    stopwatch.stop();
});

class WorkflowEngine {
    #workflows = [];
    #decisionPaths = [];
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

    getAcceptableCombintionCount() {
        this.#calculateDecisionPaths();

        const acceptablePathConditions = [];

        this.#decisionPaths.forEach((path) => {
            if (!path.isAcceptable()) return;

            acceptablePathConditions.push(path.getConditions());
        });

        let totals = 0;
        acceptablePathConditions.forEach((pathConditions) => {
            const range = new NumberRanges();
            pathConditions.forEach((requirement) => {
                range.processRequirement(requirement);
            });
            const possible = range.getTotalPossible();
            totals += possible;
        });

        return totals;
    }

    #calculateDecisionPaths() {
        const processPaths = [];
        const finishedPaths = [];
        let workflow = this.getWorkflow('in');

        processPaths.push(...workflow.getDecisionPaths());

        while(processPaths.length > 0) {
            const path = processPaths.pop();
            if (path.isComplete()) {
                finishedPaths.push(path);
                continue;
            }
            const result = path.getCurrentResult();
            workflow = this.getWorkflow(result);
            const newPaths = workflow.getDecisionPaths();

            newPaths.forEach((newPath) => {
                const clonedPath = path.clone();
                clonedPath.addRange(newPath.getDecisionList())
                processPaths.push(clonedPath);
            });
        }

        this.#decisionPaths.push(...finishedPaths);
    }
}

class Workflow {
    #name = null;
    #steps = [];
    #decisionPaths = [];

    constructor(input) {
        const regex = /([a-z]+)\{(.*)\}/;
        const matches = input.match(regex);

        this.#name = matches[1];
        this.#steps = matches[2].split(',').map((step) => new WorflowStep(step));

        this.#computeDecisionPaths();
    }

    getName() { return this.#name; }
    getDecisionPaths() { return [...this.#decisionPaths]; } 

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

    #computeDecisionPaths() {
        this.#steps.forEach((step, index) => {
            const decisionPath = new DecisionPath();

            for(let i=0; i<index; i++) {
                const prevStep = this.#steps[i];
                decisionPath.add(new Decision(prevStep.getTest(), false, null, this.#name));
            }

            const trueResult = step.getTrueResult();
            decisionPath.add(new Decision(step.getTest(), true, trueResult, this.#name));

            this.#decisionPaths.push(decisionPath);
        });
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

    hasTest() { return this.#test !== null; }
    getTest() { return this.#test; }
    getTrueResult() { return this.#trueResult; }
}

class WorkflowTest {
    #variable = null;
    #operator = null;
    #value = null;

    constructor(input) {
        const regex = /([a-z]+)([<>=]+)(\d+)/;
        const matches = input.match(regex);

        this.#variable = matches[1];
        this.#operator = matches[2];
        this.#value = Number(matches[3]);
    }

    getOperator() { return this.#operator; }
    getVariable() { return this.#variable; }
    getValue() { return this.#value; }

    testPart(part) {
        const partValue = part.getVariable(this.#variable);
        switch(this.#operator) {
            case '<': return partValue < this.#value;
            case '>': return partValue > this.#value;
            default: throw `Invalid operator: ${this.#operator}`;
        }
    }

    getTrueCondition() {
        return `${this.#variable}${this.#operator}${this.#value}`;
    }

    getFalseCondition() {
        const oppositeOperator = this.#operator === '<' ? '>=' : '<=';
        return `${this.#variable}${oppositeOperator}${this.#value}`;
    }

    toString() { return this.getTrueCondition(); }
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

class Decision {
    #workflowName = null;
    #test = null;
    #successfulTest = null;
    #result = null;

    constructor(test, successfulTest, result, workflowName) {
        this.#test = test;
        this.#successfulTest = successfulTest;
        this.#result = result;
        this.#workflowName = workflowName;
    }

    getResult() { return this.#result; } 
    isSuccessfulTest() { return this.#successfulTest; }
    getTest() { return this.#test; }

    getRequirements() {
        if (this.#test === null) return null;

        return this.#successfulTest ? this.#test.getTrueCondition() : this.#test.getFalseCondition();
    }
}

class DecisionPath {
    #decisionList = [];

    add(decision) {
        this.#decisionList.push(decision);
    }

    addRange(decisionList) {
        this.#decisionList.push(...decisionList);
    }

    clone() {
        const newPath = new DecisionPath();
        newPath.#decisionList = [ ...this.#decisionList ];

        return newPath;
    }

    getDecisionList() { return this.#decisionList; }

    getCurrentResult() {
        return this.#decisionList.at(-1).getResult();
    }

    isComplete() {
        const currentResult = this.getCurrentResult();
        return currentResult === 'A' || currentResult === 'R';
    }

    isAcceptable() {
        const currentResult = this.getCurrentResult();
        return currentResult === 'A';
    }

    getConditions() {
        const conditions = [];
        this.#decisionList.forEach((decision) => {
            const requirements = decision.getRequirements();
            if (requirements) conditions.push(requirements);
        }) ;
        return conditions;
    }
}

class NumberRanges {
    #minX = 1;
    #maxX = 4000;
    #minM = 1;
    #maxM = 4000;
    #minA = 1;
    #maxA = 4000;
    #minS = 1;
    #maxS = 4000;

    processRequirement(requirement) {
        const test = new WorkflowTest(requirement);

        const operator = test.getOperator();
        const variable = test.getVariable();
        const value = test.getValue();
        switch(operator) {
            case '>':
                this.#updateValue('min', variable, value+1);
                break;
            case '>=':
                this.#updateValue('min', variable, value);
                break;
            case '<':
                this.#updateValue('max', variable, value-1);
                break;
            case '<=':
                this.#updateValue('max', variable, value);
                break;
            default: throw `Invalid operator: ${operator}`
        }
    }

    getTotalPossible() {
        const xCount = Math.max(this.#maxX - this.#minX + 1, 0);
        const mCount = Math.max(this.#maxM - this.#minM + 1, 0);
        const aCount = Math.max(this.#maxA - this.#minA + 1, 0);
        const sCount = Math.max(this.#maxS - this.#minS + 1, 0);

        return xCount * mCount * aCount * sCount;
    }

    #updateValue(maxmin, xmas, newValue) {
        const variableName = '#' + maxmin + xmas.toUpperCase();

        const currentValue = this.#getValue(variableName);
        if (maxmin === 'max') {
            this.#setValue(variableName, Math.min(currentValue, newValue));
        }
        else if (maxmin === 'min') {
            this.#setValue(variableName, Math.max(currentValue, newValue));
        }
    }

    #getValue(variableName) {
        switch(variableName) {
            case '#minX': return this.#minX;
            case '#maxX': return this.#maxX;
            case '#minM': return this.#minM;
            case '#maxM': return this.#maxM;
            case '#minA': return this.#minA;
            case '#maxA': return this.#maxA;
            case '#minS': return this.#minS;
            case '#maxS': return this.#maxS;
            default: `Invalid variable: ${variableName}`;
        }
    }

    #setValue(variableName, value) {
        switch(variableName) {
            case '#minX': 
                this.#minX = Number(value);
                break;
            case '#maxX': 
                this.#maxX = Number(value);
                break;
            case '#minM': 
                this.#minM = Number(value);
                break;
            case '#maxM': 
                this.#maxM = Number(value);
                break;
            case '#minA': 
                this.#minA = Number(value);
                break;
            case '#maxA': 
                this.#maxA = Number(value);
                break;
            case '#minS': 
                this.#minS = Number(value);
                break;
            case '#maxS': 
                this.#maxS = Number(value);
                break;
            default: `Invalid variable: ${variableName}`;
        }
    }
}