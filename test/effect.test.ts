import { computed, effect, signal } from "../src";

describe("Effects", () => {
    it("should run whenever a dependency updates", () => {
        const a = signal(1);
        const b = signal(2);

        const effectFn = jest.fn(() => {});

        effect(effectFn, [a, b]);

        a.set(0);
        b.set(0);

        expect(effectFn).toBeCalledTimes(2);

        effectFn.mockReset();
        effectFn.mockRestore();
    });

    it("should run only once if no dependencies are passed", () => {
        const effectFn = jest.fn(() => {});

        effect(effectFn, []);

        expect(effectFn).toBeCalledTimes(1);

        effectFn.mockReset();
        effectFn.mockRestore();
    });

    it("should run the cleanup function after the dependencies update", () => {
        const a = signal(1);
        const b = signal(2);

        const effectFn = jest.fn(() => ({ cleanup: () => {} }));

        effect(effectFn, [a, b]);

        a.set(0);
        b.set(0);

        expect(effectFn).toBeCalledTimes(2);

        effectFn.mockReset();
        effectFn.mockRestore();
    });

    it("should run the effect after the computed dependency updates", () => {
        const a = signal(1);

        const b = computed(
            () => (a.unwrap() === 3 ? "three" : "not three"),
            [a]
        );

        const effectFn = jest.fn(() => {});
        effect(effectFn, [b]);

        a.set(3);
        a.set(4);

        expect(effectFn).toBeCalledTimes(2);
    });

    it("should also run the effect on mount if specified", () => {
        const a = signal(1);

        const b = computed(
            () => (a.unwrap() === 3 ? "three" : "not three"),
            [a]
        );

        const effectFn = jest.fn(() => {});
        effect(effectFn, [b], { shouldAlsoRunOn: "mount" });

        a.set(3);
        a.set(4);

        expect(effectFn).toBeCalledTimes(3);
    });
});
