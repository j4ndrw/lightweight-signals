import { renderHook, act } from "@testing-library/react-hooks";

import { useSignalStore } from "../../src/react";

test("should rerender on every write", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
        renderCount++;
        return useSignalStore({ number: 1 });
    });
    const { store } = result.current;

    expect(renderCount).toBe(1);

    act(() => {
        store.setFrom("number", (prev) => prev + 1);
    });
    expect(renderCount).toBe(2);

    act(() => {
        store.setFrom('number', (prev) => prev + 1);
    });
    expect(renderCount).toBe(3);

    act(() => {
        store.setFrom('number', (prev) => prev + 1);
    });
    expect(renderCount).toBe(4);

    const { number } = store.unwrap();
    expect(number).toBe(4);
    expect(renderCount).toBe(4);
});

test("should not rerender on read", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
        renderCount++;
        return useSignalStore({ number: 1 });
    });
    const { store } = result.current;
    expect(renderCount).toBe(1);

    const { number } = store.unwrap();
    expect(renderCount).toBe(1);
});
