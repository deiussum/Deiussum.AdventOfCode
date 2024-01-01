const readfile = require('../../common/node/readfile');
const stopwatch = require('../../common/node/stopwatch');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    stopwatch.start();
    if (lines.length === 0) stopwatch.timelog('No input to process');

    const wiringDiagram = new WiringDiagram(lines);

    const part1Total = wiringDiagram.getPart1Total();
    stopwatch.timelog(`Part 1 total: ${part1Total}`);

    stopwatch.stop();
});

class WiringDiagram {
    #components = [];

    constructor(lines) {
        this.#components = lines.map((line) => new Component(line));
        this.#connect();
    }

    getPart1Total() {
        const allConnections = this.#getConnectionsToCut();

        const totalCombinations = allConnections.length * (allConnections.length - 1) * (allConnections.length - 2);
        const period = stopwatch.startPeriodicLog(5);

        for(let cut1 = 0; cut1 < allConnections.length; cut1++) {
            for(let cut2 = cut1 + 1; cut2 < allConnections.length; cut2++) {
                for(let cut3 = cut2 + 1; cut3 < allConnections.length; cut3++) {
                    const combination = (cut1 + 1) * (cut2 + 1) * (cut3 + 1);
                    const percentDone = (100 * combination / totalCombinations).toFixed(1);
                    stopwatch.periodicLog(period, `Checking combination ${combination.toLocaleString()} of ${totalCombinations.toLocaleString()} (${percentDone}%)`);

                    this.#cutConnection(allConnections[cut1].component1, allConnections[cut1].component2);
                    this.#cutConnection(allConnections[cut2].component1, allConnections[cut2].component2);
                    this.#cutConnection(allConnections[cut3].component1, allConnections[cut3].component2);

                    this.#clearGroups();
                    const groupCount = this.#calculateGroups();
                    if (groupCount !== 2) {
                        this.#restoreConnection(allConnections[cut1].component1, allConnections[cut1].component2);
                        this.#restoreConnection(allConnections[cut2].component1, allConnections[cut2].component2);
                        this.#restoreConnection(allConnections[cut3].component1, allConnections[cut3].component2);

                        continue;
                    }

                    const group1Size = this.#getGroupSize(1);
                    const group2Size = this.#getGroupSize(2);

                    return group1Size * group2Size;

                }
            }
        }

        return null;
    }

    #getGroupSize(groupId) {
        const groupSize = this.#components.reduce((total, component) => {
            const isGroup = component.getGroup() === groupId;
            return total + (isGroup ? 1 : 0);
        }, 0);

        return groupSize;
    }

    #cutConnection(component1, component2) {
        this.#getComponent(component1).removeConnection(component2);
        this.#getComponent(component2).removeConnection(component1);
    }

    #restoreConnection(component1, component2) {
        this.#getComponent(component1).addConnection(component2);
        this.#getComponent(component2).addConnection(component1);
    }

    #clearGroups() {
        this.#components.forEach((component) => component.setGroup(null));
    }

    #calculateGroups() {
        let groupId = 0;

        while(true) {
            const nextComponent = this.#components.find((component) => component.getGroup() === null);
            if (!nextComponent) break;
            
            const componentStack = [ nextComponent ];
            groupId++;

            while(componentStack.length > 0) {
                const component = componentStack.pop();
                if (component.getGroup() !== null) continue;

                component.setGroup(groupId);

                const connections = component.getConnections().map((connection) => this.#getComponent(connection));
                componentStack.push(...connections);
            }
        }

        return groupId;
    }

    #connect() {
        const addedComponents = [];
        this.#components.forEach((component) => {
            component.getConnections().forEach((connection) => {
                const connectedComponent = this.#getComponent(connection);
                if (connectedComponent) {
                    connectedComponent.addConnection(component.getName());
                    return;
                }
                const addedComponent = addedComponents.find((added) => added.getName() === connection);
                if (addedComponent) {
                    addedComponent.addConnection(component.getName());
                    return;
                }

                const newComponent = new Component(`${connection}: ${component.getName()}`);
                addedComponents.push(newComponent);
            });
        });

        this.#components.push(...addedComponents);
    }

    #getComponent(name) {
        return this.#components.find((component) => component.getName() === name);
    }

    #getConnectionsToCut() {
        const singleConnections = []
        const connections = [];

        this.#components.forEach((component) => {
            if (component.getConnections().length === 1) {
                singleConnections.push(component.getName());
            }
        });

        this.#components.forEach((component) => {
            const component1 = component.getName();
            if (singleConnections.indexOf(component.getName()) >= 0) return;

            component.getConnections().forEach((component2) => {
                if (singleConnections.indexOf(component2) >= 0) return;

                if (connections.find((connection) => connection.component2 === component1 && connection.component1 === component2)) {
                    return;
                }
                
                connections.push({ component1, component2 });
            });
        });

        return connections;
    }
}

class Component {
    #name = null;
    #connections = [];
    #group = null;

    constructor(line) {
        this.#name = line.slice(0, 3);
        this.#connections = line.slice(5).split(' ');
    }

    getName() { return this.#name; }
    getConnections() { return this.#connections; }
    getGroup() { return this.#group; }

    addConnection(connection) {
        if (this.#connections.indexOf(connection) < 0) {
            this.#connections.push(connection);
        }
    }

    removeConnection(connection) {
        const index = this.#connections.indexOf(connection);
        if (index >= 0) {
            this.#connections.splice(index, 1);
        }
    }

    setGroup(group) {
        this.#group = group;
    }
}