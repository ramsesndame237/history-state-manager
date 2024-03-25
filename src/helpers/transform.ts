import { hashFunc } from './hash';
import {safeStringify} from "../utils/appUtilis.ts";
import type {Rule} from "../types/interfaces.ts";



// Default rule for conversion if no specific rule is provided
const defaultRule: Rule = {
    // Convert a state node to a record
    toRecord: (node) => ({
        chunks: [{ ...node, children: undefined }], // Extract relevant information into chunks
        children: node.children // Keep children for reconstruction
    }),
    // Convert a record to a state node
    fromRecord: ({ chunks, children }) => ({ ...chunks[0], children }), // Merge chunks back into a state node
    match: (node) => true // Default match always returns true
};

// Function to convert a state node to a record
export function state2Record(
    stateNode: any, // The state node to convert
    chunkPool: { [key: string]: string }, // A pool to store chunks for reuse
    rules: Rule[] = [], // Optional conversion rules
    prevRecord: { hashes: string[], children?: any[] } | null = null, // Previous record for optimization
    pickIndex: number = -1 // Index of child node to pick for update
): { hashes: string[], ruleIndex: number, children?: any[] } {
    // Find matching rule for conversion or use default rule
    const ruleIndex = rules.findIndex(({ match }) => match(stateNode));
    const rule = rules[ruleIndex] || defaultRule;

    // Extract relevant information from the state node into chunks
    const { chunks, children } = rule.toRecord(stateNode);
    const recordChildren = children;
    const hashes: string[] = [];

    // Calculate hash for each chunk and store it in the chunk pool
    for (const chunk of chunks) {
        const chunkStr = safeStringify(chunk, 0); // Convert chunk to string
        const hashKey = hashFunc(chunkStr); // Calculate hash for the chunk
        hashes.push(hashKey.toString());
        chunkPool[hashKey] = chunkStr; // Store the chunk in the pool with its hash as key
    }

    // Update record with new children if pickIndex is specified
    if (pickIndex !== -1 && prevRecord?.children) {
        const childrenCopy = [...prevRecord.children];
        childrenCopy[pickIndex] = state2Record(
            recordChildren[pickIndex], chunkPool, rules
        );
        return { hashes, ruleIndex, children: childrenCopy };
    } else {
        // Return the record with hashes and converted children
        return {
            hashes,
            ruleIndex,
            children: children &&
                children.map(node => state2Record(node, chunkPool, rules))
        };
    }
}

// Function to convert a record to a state node
export function record2State(
    recordNode: { hashes: string[], ruleIndex: number, children?: any[] }, // The record node to convert
    chunkPool: { [key: string]: string }, // A pool containing stored chunks
    rules: Rule[] = [] // Optional conversion rules
): any {
    const { hashes, ruleIndex, children } = recordNode;

    // Retrieve chunks from the chunk pool using hashes
    const chunks = hashes.map(hash => JSON.parse(chunkPool[hash]));

    // Find rule for conversion or use default rule
    const rule = rules[ruleIndex] || defaultRule;

    // Reconstruct state node from chunks and convert children recursively
    return rule.fromRecord({
        chunks,
        children: children && children.map(
            node => record2State(node, chunkPool, rules)
        ) as any
    });
}
