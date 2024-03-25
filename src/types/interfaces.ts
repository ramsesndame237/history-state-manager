export interface Rule {
    match: (node: any) => boolean; // Function to match a state node
    toRecord: (node: any) => { chunks: any[], children: any[] }; // Function to convert a state node to a record
    fromRecord: (record: { chunks: any[], children: any[] }) => any; // Function to convert a record to a state node
}