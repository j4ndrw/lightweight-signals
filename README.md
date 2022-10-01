# Lightweight Signals

## Core functionality

You can use the `signal`, `computed` and `effect` primitives to make your program reactive. Think of this being a way to use React's `useState`, `useMemo` and `useEffect` in non-React / non-frontend applications.

I mostly implemented those to learn more about ways of implementing reactivity. It works well enough as a PoC, but I wouldn't recommend using it in production.

## React bindings

React already comes with reactive primitives, but I wanted to add a simple way to create a store. The `useSignalStore` binding is heavily inspired by [Valtio](https://github.com/pmndrs/valtio), where, rerenders are only caused by updating values in the store, and not by reading from the store.

## Usage

### Node
```ts
import { signal, computed, effect } from 'lightweight-signals';

// Create a signal:
const count = signal(0);

// Create a computed signal:
const doubledCount = computed(() => count.unwrap() * 2, [count]);
// Will update when `count` updates.

// Create an effect:
effect(() => {
    console.log(`The value of the doubled count is ${doubledCount.unwrap()}`);
}, [doubledCount])
// Will run every type `doubledCount` is updated.

// Update a signal
count.set(7); 
// Will cause `doubledCount` to update to `count * 2` (7 * 2 = 14). It will also trigger the effect.

// Update a signal based on its previous value
count.setFrom(prev => prev - 3);
// Will cause `doubledCount` to update to `count * 2` ((7 - 3) * 2 = 8). It will also trigger the effect.
```
## React

```tsx
// useStore.tsx
import { useSignalStore } from 'lightweight-signals/dist/react';

interface Store {
    realName: string,
    heroName: string,
}

const store: Store = {
    realName: "Peter Parker",
    heroName: "Spider-Man"
}

export const useStore = () => useSignalStore(store);

// App.tsx
import { useStore } from './useStore';

export const App = () => {
    const { store } = useStore();
    const { realName, heroName } = store.unwrap()

    useEffect(() => {
        store.set('realName', "Bruce Wayne");
        store.set('heroName', "Batman");
    }, [])

    return <div>
        <p>{ heroName }'s real name is { realName }</p>
    </div>
}
```