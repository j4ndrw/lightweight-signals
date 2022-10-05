import { SignalPrimitive } from "./internals";

export type SignalType = "primitive" | "computed";

export type EffectPrimitive = {
    fn: () => void | { cleanup: () => void };
    cleanup?: void | (() => void);
};
export type EffectOptions = {
    shouldAlsoRunOn: 'mount'
}

export type Signal<T> = Pick<
    SignalPrimitive<T>,
    "unwrap" | "set" | "setFrom"
>;
export type SignalSnapshot<T> = Pick<Signal<T>, "unwrap">;
export type Computed<T> = SignalSnapshot<T>;
