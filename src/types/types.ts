
export type State = any; // Define your State type appropriately

export type Rule = {
    match: (state: State) => boolean;
    toRecord: (node: State) => { chunks: any[]; children: State[] };
    fromRecord: ({ chunks, children }: { chunks: any[]; children: State[] }) => State;
};

export type Options = {
    initialState?: State;
    rules?: Rule[];
    delay?: number;
    maxLength?: number;
    onChange?: (state: State | null) => void;
    useChunks?: boolean;
};

