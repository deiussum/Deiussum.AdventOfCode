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

        const destinations = parts[2].split(', ');
        this.#destinations = destinations.map((dest) => {
            return dest.trim();
        });
    }

    getName() { return this.#name; }
    getType() { return this.#type; }
    getDestinations() { return [...this.#destinations]; }

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
        }
    }

    emit() {
        return this.#pendingEmits.shift();
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
}
