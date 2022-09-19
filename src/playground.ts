import { computed, effect, signal } from ".";

const counter = signal(0);
const fivesDivisor = computed(() => counter.value % 5, [counter]);

effect(() => {
    console.log(`Counter has updated to ${counter.value}`);

    return { cleanup: () => console.log("Clean clean clean...") };
}, [counter]);

effect(() => {
    console.log(`Five's divisor has updated to ${fivesDivisor.value}`);
}, [fivesDivisor]);

setInterval(() => {
    counter.set(counter.value + 1);
}, 1000);
