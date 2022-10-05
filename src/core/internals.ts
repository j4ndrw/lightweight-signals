import { EffectPrimitive, SignalType } from "./types";

export class SignalPrimitive<T> {
    type: SignalType;
    value: T;
    prevValue: T | null;
    links: Set<SignalPrimitive<unknown>>;
    effects: EffectPrimitive[];
    compute?: () => T;

    constructor(value: T, type: SignalType, compute?: () => T) {
        this.type = type;
        this.value = value;
        this.prevValue = null;
        this.links = new Set();
        this.effects = [];

        if (type === "computed") {
            this.prevValue = this.value;
            this.compute = compute;
        }
    }

    /**
     * Returns the value of the signal
     */
    unwrap() {
        return this.value;
    }

    /**
     * Sets the value of the signal. It also has the following side effects:
     * - Causes effects linked to this signal to rerun
     * - Causes computed signals to be recomputed
     */
    set(newValue: T) {
        this.prevValue = this.value;
        this.value = newValue;

        this.runEffects();
        this.recomputeComputedSignals();
    }

    /**
     * Sets the value of the signal based on the signal's previous value. It also has the following side effects:
     * - Causes effects linked to this signal to rerun
     * - Causes computed signals to be recomputed
     */
    setFrom(setter: (prevValue: T) => T) {
        this.set(setter(this.value));
    }

    linkWith<TSignal>(signals: SignalPrimitive<TSignal>[]) {
        signals.forEach((signal) => {
            this.links.add(signal);
            signal.links.add(this);
        });
        return this;
    }

    addEffect(effectFn: () => void | { cleanup: () => void }) {
        this.effects.push({ fn: effectFn });
        return this;
    }

    private runEffects() {
        this.effects.forEach((effect) => {
            if (effect.cleanup) effect.cleanup();
            effect.cleanup = effect.fn()?.cleanup;
        });
        return this;
    }

    private recomputeComputedSignals() {
        this.links.forEach((link) => {
            if (link.type === "computed") link.set(link.compute!());
        });
        return this;
    }

    kill() {
        this.effects = [];

        this.links.forEach((link) => {
            link.links.delete(this);
        });
        this.links.clear();
        return this;
    }
}

export const signalPrimitive = <T>(
    value: T,
    type: SignalType,
    compute?: () => T
) => new SignalPrimitive(value, type, compute);
