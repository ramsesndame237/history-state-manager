/**
 * Generates a hash value for a given string using the MurmurHash3 algorithm.
 * @param {string} input - The input string to hash.
 * @param {number} [seed=0] - The seed value for the hash function.
 * @returns {number} The hash value.
 */
function murmurHash3(input:string, seed:number = 0) {
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    const r1 = 15;
    const r2 = 13;
    const m = 5;
    const n = 0xe6546b64;

    let hash = seed;
    let len = input.length;

    for (let i = 0; i < len; i++) {
        let code = input.charCodeAt(i);
        hash ^= code;
        hash = (hash << r1) | (hash >>> (32 - r1));
        hash = ((hash * c1) & 0xffffffff) >>> 0;
        hash = (hash * c2) >>> 0;
    }

    hash ^= len;
    hash ^= (hash >>> 16);
    hash = ((hash * 0x85ebca6b) & 0xffffffff) >>> 0;
    hash ^= (hash >>> 13);
    hash = ((hash * 0xc2b2ae35) & 0xffffffff) >>> 0;
    hash ^= (hash >>> 16);

    return hash >>> 0;
}

export const hashFunc = murmurHash3;
