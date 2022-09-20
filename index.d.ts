declare interface Signal<T> {
    value: T,
    set: (newValue: T) => void,
    setFrom: (setter: (prevValue: T) => T) => void;
}

declare interface Computed<T> {
    value: T
}