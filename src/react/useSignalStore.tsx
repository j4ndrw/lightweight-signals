import { useState } from "react";
import { Signal, signal, SignalPrimitive } from "../core";

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

export function useSignalStore<T extends object>(value: T) {
    const [proxySignal, setProxySignal] = useState(
        makeProxySignal(value, (newSignal) => {
            setProxySignal(newSignal);
        })
    );

    return {
        store: {
            unwrap: () => proxySignal.unwrap(),
            select: (key: keyof T) => proxySignal.unwrap()[key],
            set: (key: keyof T, value: T[keyof T]) => {
                proxySignal.setFrom((prevSignal) => ({
                    ...prevSignal,
                    [key]: value,
                }));
            },
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
