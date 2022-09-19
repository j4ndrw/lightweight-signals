type SignalType = "primitive" | "computed";

type Effect = {
    fn: () => void | { cleanup: () => void };
    cleanup?: void | (() => void);
};

class Signal<T> {
    type: SignalType;

    value: T;
    prevValue: T | null = null;

    links: Set<Signal<unknown>> = new Set();

    effects: Effect[];

    compute?: () => T;

    constructor(value: T, type: SignalType, compute?: () => T) {
        this.type = type;
        this.value = value;

        this.effects = [];

        if (type === "computed") {
            this.prevValue = this.value;
            this.compute = compute;
        }
    }

    set(newValue: T) {
        this.prevValue = this.value;
        this.value = newValue;

        this.runEffects();
        this.links.forEach((link) => {
            if (link.type === "computed") link.set(link.compute!());
        });
    }
    setFrom(setter: (prevValue: T) => T) {
        this.set(setter(this.value));
    }

    linkWith<TSignal>(signals: Signal<TSignal>[]) {
        signals.forEach((signal) => {
            this.links.add(signal);
            signal.links.add(this);
        });
    }

    addEffect(effectFn: () => void | { cleanup: () => void }) {
        this.effects.push({ fn: effectFn });
    }

    runEffects() {
        this.effects.forEach((effect) => {
            if (effect.cleanup) effect.cleanup();
            effect.cleanup = effect.fn()?.cleanup;
        });
    }
}

export const signal = <T>(
    value: T,
    type: SignalType = "primitive"
): Signal<T> => new Signal(value, type);

export const computed = <TResult, TDep>(
    computeFn: () => TResult,
    deps: Signal<TDep>[]
): Signal<TResult> => {
    const computedSignal = new Signal(computeFn(), "computed", computeFn);
    computedSignal.linkWith(deps);

    return computedSignal;
};

export const effect = <TDep>(
    effectFn: () => void | { cleanup: () => void },
    deps: Signal<TDep>[]
): void => {
    if (deps.length === 0) {
        effectFn();
        return;
    }

    deps.forEach((dep) => dep.addEffect(effectFn));
};
