const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const machine = new Machine(lines);
    const results = machine.run(1000);
    stopwatch.timelog(`Part 1 results: ${results}`);

    machine.reset();
    machine.addFinalModule('rx');
    const cycleCount = machine.runUntilOn();
    stopwatch.timelog(`Part 2 results: ${cycleCount}`);


    stopwatch.stop();
});

class Module {
    #name = null;
    #type = null;
    #destinations = [];
    #inputs = {};
    #isOn = false;
    #pendingEmits = [];

    constructor(line) {
        const regex = /^(.*) -> (.*)$/;
        const parts = regex.exec(line);

        const name = parts[1];

        if (name[0] === '%' || name[0] === '&') {
            this.#type = name[0];
            this.#name = name.slice(1);
        }
        else {
            this.#name = name;
            this.#type = 'broadcaster';
        }

        if (parts[2].trim() === '') return;
        if (parts[2].trim() === 'final') { 
            this.#type = 'final';
            return;
        }

        const destinations = parts[2].split(', ');
        this.#destinations = destinations.map((dest) => {
            return dest.trim();
        });
    }

    getName() { return this.#name; }
    getType() { return this.#type; }
    getDestinations() { return [...this.#destinations]; }
    isOn() { return this.#isOn; }

    connect(inputName) {
        this.#inputs[inputName] = 'low';
    }

    receivePulse(pulse, from) {
        this.#inputs[from] = pulse;

        switch (this.#type) 
        {
            case 'broadcaster': 
                this.#pendingEmits.push(pulse);
                break; 
            case '%': 
                this.#receiveFlipFlop(pulse);
                break;
            case '&': 
                this.#receiveConjunction(pulse);
                break;
            case 'final':
                this.#isOn = this.#isOn || pulse === 'low';
                break;
        }
    }

    emit() {
        return this.#pendingEmits.shift();
    }

    reset() {
        this.#isOn = false;
        this.#pendingEmits = [];
        for(let key in this.#inputs) {
            this.#inputs[key] = 'low';
        }
    }

    #receiveFlipFlop(pulse) {
        if (pulse === 'low') {
            this.#isOn = !this.#isOn;
            this.#pendingEmits.push(this.#emitFlipFlop());
        }
    }

    #receiveConjunction(pulse) {
        this.#pendingEmits.push(this.#emitConjunction());
    }

    #emitFlipFlop() {
        return this.#isOn ? 'high' : 'low';
    }

    #emitConjunction() {
        let allHigh = true;
        for (let key in this.#inputs) {
            if (this.#inputs[key] !== 'high') {
                allHigh = false;
                break;
            }
        }
        return allHigh ? 'low' : 'high';
    }
}

class Machine {
    #modules = [];
    #highPulseCount = 0;
    #lowPulseCount = 0;

    constructor(lines) {
        lines.forEach((line) => {
            const module = new Module(line);
            this.addModule(module);
        });

        this.#connectModules();
    }

    addModule(module) {
        this.#modules.push(module);
    }

    run(cycles) {
        for(let i = 0; i < cycles; i++) {
            this.#runCycle();
        }

        return this.#highPulseCount * this.#lowPulseCount;
    }

    reset() {
        this.#highPulseCount = 0;
        this.#lowPulseCount = 0;
        this.#modules.forEach((module) => module.reset());
    }

    addFinalModule(name) {
        const finalModule = new Module(`${name} -> final`);
        this.#modules.push(finalModule);
    }

    runUntilOn() {
        let cycleCount = 0;
        const finalModule = this.#getFinalModule();

        // NOTE: cycleCount > 1,000,000,000,000, but less than 250,000,000,000,000
        const period = stopwatch.startPeriodicLog(5);
        while(!finalModule.isOn()) {
            stopwatch.periodicLog(period, `Current cycle: ${cycleCount.toLocaleString()}`);
            this.#runCycle();
            cycleCount++;
        }

        return cycleCount;
    }

    #connectModules() {
        this.#modules.forEach((module) => {
            const destinations = module.getDestinations().map((dest) => {
                return this.#getModuleByName(dest);
            });
            
            destinations.forEach((destination) => {
                destination.connect(module.getName());
            });
        });
    }

    #runCycle() {
        const modules = [];
        const broadcaster = this.#getModuleByName('broadcaster');
        modules.push(broadcaster);

        broadcaster.receivePulse('low', 'button');
        this.#lowPulseCount++;

        while(modules.length > 0) {
            const module = modules.shift();
            const nextModules = module.getDestinations().map((dest) => this.#getModuleByName(dest));

            const pulse = module.emit();
            if (!pulse) continue;

            nextModules.forEach((nextModule) => {
                if (pulse === 'low') this.#lowPulseCount++;
                if (pulse === 'high') this.#highPulseCount++;

                nextModule.receivePulse(pulse, module.getName());
            });
            modules.push(...nextModules);
        }

        return;
    }

    #getModuleByName(name) {
        const foundModule = this.#modules.find((module) => module.getName() === name);
        if (foundModule) return foundModule;

        return new Module(`${name} -> `);
    }

    #getFinalModule(name) {
        const foundModule = this.#modules.find((module) => module.getType() === 'final');
        return foundModule;
    }
}
