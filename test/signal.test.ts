import { signal } from "../src/core";

describe("Signals", () => {
    it("should have a set value once created", () => {
        const testSignal = signal(2);
        expect(testSignal.unwrap()).toBe(2);
    });

    it("should have a working setter primitive", () => {
        const testSignal = signal(2);
        testSignal.set(3);
        expect(testSignal.unwrap()).toBe(3);
    });

    it("should have a working setter function", () => {
        const testSignal = signal({
            someField: "someValue",
            fieldToUpdate: 2,
        });
        testSignal.setFrom((prev) => ({ ...prev, fieldToUpdate: 3 }));
        expect(testSignal.unwrap()).toStrictEqual({
            someField: "someValue",
            fieldToUpdate: 3,
        });
    });
});
