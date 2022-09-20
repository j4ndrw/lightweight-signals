import { computed, signal } from "../src";

describe("Computed signals", () => {
    it("should update when the signal that it is subscribed to update", () => {
        const num = signal(0);
        const parity = computed(
            () => (num.unwrap() % 2 === 0 ? "even" : "odd"),
            [num]
        );

        expect(parity.unwrap()).toBe("even");

        num.setFrom((prev) => prev + 1);

        expect(parity.unwrap()).toBe("odd");
    });

    it("should update when the signals that it is subscribed to update", () => {
        const sounds = signal(["Argh", "Ugh", "Ouch", "Grrrr", "Hmmm", "Aha"]);
        const words = signal(["Ayy", "Hello", "Anchor"]);

        const wordsThatStartWithA = computed(
            () =>
                [...sounds.unwrap(), ...words.unwrap()].filter((word) =>
                    word.startsWith("A")
                ),
            [sounds, words]
        );

        expect(wordsThatStartWithA.unwrap()).toStrictEqual([
            "Argh",
            "Aha",
            "Ayy",
            "Anchor",
        ]);

        sounds.set(['Aaaaaaaa']);
        words.set(['chair']);

        expect(wordsThatStartWithA.unwrap()).toStrictEqual(['Aaaaaaaa']);
    });

    it("should call the compute function only when the deps in the dep array change", () => {
        const a = signal(1);
        const b = signal(2);
        const c = signal(3);

        const computeFn = jest.fn(() => null);
        const comp = computed(computeFn, [a, b]);

        a.set(0);
        b.set(0);
        c.set(0);

        comp.unwrap();

        expect(computeFn).toBeCalledTimes(3);

        computeFn.mockReset();
        computeFn.mockRestore()
    }),

    it("should call the compute function only once if no dep array is defined", () => {
        const computeFn = jest.fn(() => null);
        const comp = computed(computeFn, []);

        comp.unwrap();

        expect(computeFn).toBeCalledTimes(1);

        computeFn.mockReset();
        computeFn.mockRestore()
    })
});
