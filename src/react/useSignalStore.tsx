import { useState } from "react";
import { Signal, signal } from "../core";
import { SignalPrimitive } from "../core/internals";

type StoreSetter<T extends object> = (prevValue: T[keyof T]) => T[keyof T];

function makeProxySignal<T>(value: T, onSet: (newSignal: Signal<T>) => void) {
    const proxySignal = new Proxy(signal(value), {
        set(target, p, newValue, receiver) {
            if (p === "value") {
                const newSignalFromTarget = {
                    ...target,
                    value: newValue,
                } as Signal<T>;
                Object.setPrototypeOf(
                    newSignalFromTarget,
                    SignalPrimitive.prototype
                );

                (target as any).kill();

                onSet(newSignalFromTarget);
            }
            (target as any)[p] = newValue;
            return true;
        },
    });

    return proxySignal;
}

/**
 * Creates a store signal.
 */
export function useSignalStore<T extends object>(value: T) {
    const [proxySignal, setProxySignal] = useState(
        makeProxySignal(value, (newSignal) => {
            setProxySignal(newSignal);
        })
    );

    return {
        store: {
            /**
             * Returns the value of the signal
             */
            unwrap: () => proxySignal.unwrap(),

            /**
             * Sets the value of a field in the store.
             */
            set: (key: keyof T, value: T[keyof T]) => {
                proxySignal.setFrom((prevSignal) => ({
                    ...prevSignal,
                    [key]: value,
                }));
            },

            /**
             * Sets the value of the signal based on the signal's previous value.
             */
            setFrom: (
                key: keyof T,
                setter: (prevValue: T[keyof T]) => T[keyof T]
            ) => {
                proxySignal.setFrom((prevSignal) => ({
                    ...prevSignal,
                    [key]: setter(prevSignal[key]),
                }));
            },
        },
    };
}
