import { signalPrimitive, SignalPrimitive } from "./internals";
import { Signal, Computed, SignalSnapshot, EffectOptions } from "./types";

export { Signal, Computed };

export const signal = <T>(value: T): Signal<T> =>
    signalPrimitive(value, "primitive");

export const computed = <TResult>(
    computeFn: () => TResult,
    deps: SignalSnapshot<unknown>[]
): Computed<TResult> =>
    signalPrimitive(computeFn(), "computed", computeFn).linkWith(
        deps as SignalPrimitive<unknown>[]
    );

export const effect = <TDep>(
    effectFn: () => void | { cleanup: () => void },
    deps: SignalSnapshot<TDep>[],
    options?: EffectOptions
): void => {
    if (deps.length === 0) {
        effectFn();
        return;
    }

    if (options?.shouldAlsoRunOn === "mount") effectFn();

    deps.forEach((dep) => (dep as SignalPrimitive<TDep>).addEffect(effectFn));
};
