const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const INPUT = 'input.txt';

readfile.readfile(INPUT, (lines) => {
    if (lines.length === 0) console.log('No input to process');

    const nodeMap = new NodeMap();

    let instructions = '';
    lines.forEach((line, index) => {
        if (index == 0) instructions = line;
        if (index < 2) return;

        nodeMap.addNode(line);
    });

    const path = nodeMap.getPath(instructions);
    console.log(`Path length: ${path.length}`);
});

class Node {
    #label = '';
    #left = '';
    #right = '';

    constructor(line) {
        const regex = /^([A-Z]{3}) = \(([A-Z]{3}), ([A-Z]{3})\)$/;
        const matches = regex.exec(line);

        this.#label = matches[1];
        this.#left = matches[2];
        this.#right = matches[3];
    }

    getLabel() { return this.#label; }
    getLeft() { return this.#left; }
    getRight() { return this.#right; }
}

class NodeMap {
    #nodes = {};

    addNode(line) {
        const node = new Node(line);
        this.#nodes[node.getLabel()] = node;
    }

    getNode(label) {
        return this.#nodes[label];
    }

    getPath(instructions) {
        const path = [];

        let currentNode = this.getNode('AAA');
        const lastNode = this.getNode('ZZZ');
        let instructionIndex = 0;
        while(currentNode !== lastNode) {
            const nextInstruction = instructions[instructionIndex];

            path.push(currentNode);

            if (nextInstruction === 'R') currentNode = this.getNode(currentNode.getRight());
            if (nextInstruction === 'L') currentNode = this.getNode(currentNode.getLeft());

            instructionIndex = (instructionIndex + 1) % instructions.length;
        }

        return path;
    }
}

