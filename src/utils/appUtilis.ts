/**
 * Safely converts an object to a JSON string, handling circular references.
 * @param obj - The object to stringify.
 * @param indent - The number of spaces to use for indentation.
 * @returns The JSON string representation of the object.
 */
export function safeStringify(obj: any, indent: number = 2): string {
    let cache: Set<any> = new Set(); // Cache to track visited objects
    const retVal: string = JSON.stringify(
        obj,
        (key: string, value: any) =>
            typeof value === 'object' && value !== null
                ? cache.has(value)
                    ? undefined // Discard key if object is a duplicate reference
                    : cache.add(value) && value // Add object to cache and return value
                : value,
        indent // Indentation for formatting
    );
    // @ts-ignore
    cache = null; // Clear cache after stringify
    return retVal;
}
