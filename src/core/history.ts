import {record2State, state2Record} from "../helpers/transform.ts";
import type {Options, Rule, State} from "../types/types.ts";



const noHandleOnchange = () => {};

export class History {
    private rules: Rule[];
    private delay: number;
    private maxLength: number;
    private useChunks: boolean;
    private onChange: (state: State | null) => void;

    private $index: number;
    private $records: (State | null)[];
    private $chunks: Record<string, string>;

    private $pending: {
        state: State | null;
        pickIndex: number | undefined;
        onResolves: ((value: History) => void)[];
        timer: NodeJS.Timeout | undefined;
    };

    private $debounceTime: number | null;

    constructor(options: Options = {}) {
        this.rules = options.rules || [];
        this.delay = options.delay || 50;
        this.maxLength = options.maxLength || 100;
        this.useChunks = options.useChunks === undefined ? true : options.useChunks;
        this.onChange = options.onChange || noHandleOnchange;

        this.$index = -1;
        this.$records = [];
        this.$chunks = {};

        this.$pending = {
            state: null,
            pickIndex: undefined,
            onResolves: [],
            timer: undefined,
        };

        this.$debounceTime = null;

        if (options.initialState !== undefined) {
            this.pushSync(options.initialState);
        }

        if (options.onChange) {
            this.onChange = options.onChange;
        }
    }

    get hasRedo(): boolean {
        if (this.$index === this.$records.length - 1) return false;

        let hasRecordAfterIndex = false;
        for (let i = this.$index + 1; i < this.$records.length; i++) {
            if (this.$records[i] !== null) hasRecordAfterIndex = true;
        }
        return hasRecordAfterIndex;
    }

    get hasUndo(): boolean {
        const lowerBound = Math.max(this.$records.length - this.maxLength, 0);
        return this.$index > lowerBound;
    }

    get length(): number {
        return Math.min(this.$records.length, this.maxLength);
    }

    get(): State | null {
        const currentRecord = this.$records[this.$index];
        let resultState: State | null;
        if (!currentRecord) {
            resultState = null;
        } else if (!this.useChunks) {
            resultState = currentRecord;
        } else {
            resultState = record2State(currentRecord, this.$chunks, this.rules);
        }
        this.onChange(resultState);
        return resultState;
    }

    pushSync(state: State, pickIndex: number = -1): this {
        const latestRecord = this.$records[this.$index] || null;
        const record = this.useChunks
            ? state2Record(state, this.$chunks, this.rules, latestRecord, pickIndex)
            : state;
        this.$index++;
        this.$records[this.$index] = record;

        for (let i = this.$index + 1; i < this.$records.length; i++) {
            this.$records[i] = null;
        }

        if (this.$index >= this.maxLength) {
            this.$records[this.$index - this.maxLength] = null;
        }

        if (this.$pending.timer) {
            clearTimeout(this.$pending.timer);
            this.$pending.state = null;
            this.$pending.pickIndex = undefined;
            this.$pending.timer = undefined;
            this.$debounceTime = null;
            this.$pending.onResolves.forEach((resolve) => resolve(this));
            this.$pending.onResolves = [];
        }

        this.onChange(state);
        return this;
    }

    async push(state: State, pickIndex: number = -1): Promise<this> {
        const currentTime = Date.now();
        const setupPending = (): Promise<this> => {
            this.$pending.state = state;
            this.$pending.pickIndex = pickIndex;
            this.$debounceTime = currentTime;
            return new Promise((resolve) => {
                // @ts-ignore
                this.$pending.onResolves.push(resolve);
                // @ts-ignore
                this.$pending.timer = setTimeout(() => {
                    this.pushSync(this.$pending.state!, this.$pending.pickIndex);
                }, this.delay);
            });
        };

        if (this.$pending.timer === null) {
            return setupPending();
        } else if (currentTime - this.$debounceTime! < this.delay) {
            clearTimeout(this.$pending.timer);
            this.$pending.timer = undefined;
            return setupPending();
        } else {
            throw new Error('Invalid push operation');
        }
    }

    undo(): this {
        if (this.hasUndo) this.$index--;
        return this;
    }

    redo(): this {
        if (this.hasRedo) this.$index++;
        return this;
    }

    reset(): this {
        this.$index = -1;
        this.$records = [];
        this.$chunks = {};
        clearTimeout(this.$pending.timer!);
        this.$pending = {
            state: null,
            pickIndex: undefined,
            onResolves: [],
            timer: undefined,
        };
        this.$debounceTime = null;
        return this;
    }
}
