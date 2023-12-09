const readfile = require('../../common/node/readfile');

const TEST_INPUT = 'input-test.txt';
const TEST_INPUT2 = 'input-test2.txt';
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

    const path1 = nodeMap.getPath(instructions);
    console.log(`Path length: ${path1.length}`);

    const startTime = new Date();
    console.log(`Started at ${startTime}`);
    // This solution takes way too long. I ran it for around 12 hours and it barely broke 
    // 250 million.  The answer is around 7 trillion, so I gave up on it. :)
    //const path2Size = nodeMap.getGhostPath(instructions);

    // There is no logical reason this should have worked, but it does.  It only works because
    // the puzzle is setup so each of the paths has a recurring pattern between the start and
    // end nodes and you need to find the lowest common multiple.  
    const path2Size = nodeMap.getPart2PathLcm(instructions);
    console.log(`Path length part 2: ${path2Size}`);
    const endTime = new Date();
    const timeSpent = endTime - startTime;
    console.log(`Finished at ${endTime}.  ${timeSpent}ms`);
});

class Node {
    #label = '';
    #left = '';
    #right = '';

    constructor(line) {
        const regex = /^([A-Z0-9]{3}) = \(([A-Z0-9]{3}), ([A-Z0-9]{3})\)$/;
        const matches = regex.exec(line);

        this.#label = matches[1];
        this.#left = matches[2];
        this.#right = matches[3];
    }

    getLabel() { return this.#label; }
    getLeft() { return this.#left; }
    getRight() { return this.#right; }

    isStartingNode() { return this.#label[2] === 'A'; }
    isEndingNode() { return this.#label[2] === 'Z'; }
}

class NodeMap {
    #nodes = {};
    #startingNodes = [];
    #endingNodes = [];

    addNode(line) {
        const node = new Node(line);
        this.#nodes[node.getLabel()] = node;

        if (node.isStartingNode()) this.#startingNodes.push(node);
        if (node.isEndingNode()) this.#endingNodes.push(node);
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

    getPart2PathLcm(instructions) {
        const distances = [];

        this.#startingNodes.forEach((node) => {
            distances.push(this.#getDistanceToFirstEndNode(node, instructions));
        });

        console.log(distances);

        let lcm = 0;
        distances.forEach((distance) => {
            if (lcm === 0) {
                lcm = distance;
            }
            else {
                lcm = this.#getLcm(lcm, distance);
            }
        });

        return lcm; 
    }

    getGhostPath(instructions) {
        let pathCount = 0;
        let currentNodes = this.#startingNodes;
        let instructionIndex = 0;
        while(!this.#areAllEndingNodes(currentNodes)) {
            const nextInstruction = instructions[instructionIndex];

            currentNodes = this.#getNextNodes(nextInstruction, currentNodes);
            instructionIndex = (instructionIndex + 1) % instructions.length;
            pathCount++;
        }
        return pathCount;
    }

    #getLcm(number1, number2) {
        let maxN = Math.max(number1, number2);

        let multiplier = 1;
        let testLcm = maxN * multiplier;
        let keepLooking = true;
        while(keepLooking) {
            let found = testLcm % number1 === 0 && testLcm % number2 === 0;

            keepLooking = !found;

            if (!found) {
                multiplier++;
                testLcm = maxN * multiplier;
            }
        }

        return testLcm;
    }

    #getDistanceToFirstEndNode(node, instructions) {
        let pathCount = 0;
        let currentNode = node;
        let instructionIndex = 0;
        while(!currentNode.isEndingNode()) {
            const nextInstruction = instructions[instructionIndex];
            currentNode = this.#getNextNode(nextInstruction, currentNode);
            instructionIndex = (instructionIndex + 1) % instructions.length;
            pathCount++;
        }
        return pathCount;

    }

    #getNextNode(instruction, node) {
        if(instruction === 'R') return this.getNode(node.getRight());
        if(instruction === 'L') return this.getNode(node.getLeft());
    }

    #getNextNodes(instruction, nodes) {
        const newNodes = [];

        nodes.forEach((node) => {
            newNodes.push(this.#getNextNode(instruction, node));
        });

        return newNodes;
    }

    #areAllEndingNodes(nodes) {
        let endingCount = 0;

        nodes.forEach((node) => {
            if (node.isEndingNode()) endingCount++;
        });

        return endingCount === nodes.length;
    }
}

