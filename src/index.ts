type SignalType = "primitive" | "computed";

type EffectPrimitive = {
    fn: () => void | { cleanup: () => void };
    cleanup?: void | (() => void);
};

class SignalPrimitive<T> {
    type: SignalType;

    value: T;
    prevValue: T | null = null;

    links: Set<SignalPrimitive<unknown>> = new Set();

    effects: EffectPrimitive[];

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

    linkWith<TSignal>(signals: SignalPrimitive<TSignal>[]) {
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

export type Signal<T> = Omit<
    SignalPrimitive<T>,
    | "addEffect"
    | "runEffects"
    | "linkWith"
    | "prevValue"
    | "type"
    | "links"
    | "effects"
    | "compute"
>;
export type Computed<T> = Signal<T>;

export const signal = <T>(
    value: T,
    type: SignalType = "primitive"
): Signal<T> => new SignalPrimitive(value, type);

export const computed = <TResult, TDep>(
    computeFn: () => TResult,
    deps: Signal<TDep>[]
): Computed<TResult> => {
    const computedSignal = new SignalPrimitive(
        computeFn(),
        "computed",
        computeFn
    );
    computedSignal.linkWith((deps as SignalPrimitive<TDep>[]));

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

    (deps as SignalPrimitive<TDep>[]).forEach((dep) => dep.addEffect(effectFn));
};
