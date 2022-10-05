import { signalPrimitive, SignalPrimitive } from "./internals";
import { Signal, Computed, SignalSnapshot, EffectOptions } from "./types";

export { Signal, Computed };

export const signal = <T>(value: T): Signal<T> =>
    signalPrimitive(value, "primitive");

export const computed = <TResult, TDep>(
    computeFn: () => TResult,
    deps: Signal<TDep>[]
): Computed<TResult> =>
    signalPrimitive(computeFn(), "computed", computeFn).linkWith(
        deps as SignalPrimitive<TDep>[]
    );

export const effect = <TDep>(
    effectFn: () => void | { cleanup: () => void },
    deps: SignalSnapshot<TDep>[],
    options?: EffectOptions,
): void => {
    if (deps.length === 0) {
        effectFn();
        return;
    }

    if (options?.shouldAlsoRunOn === 'mount') effectFn();

    deps.forEach((dep) => (dep as SignalPrimitive<TDep>).addEffect(effectFn));
};
