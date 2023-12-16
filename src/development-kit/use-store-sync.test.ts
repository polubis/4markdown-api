import { renderHook } from '@testing-library/react';
import { useStoreSync } from './use-store-sync';
import { create } from 'zustand';

describe(`Store sync works when:`, () => {
  it(`state is synced`, () => {
    const spy = jest.fn();

    const useCounterStore = create(() => ({
      is: `idle`,
    }));
    useCounterStore.setState = spy;

    renderHook(() => useStoreSync(useCounterStore, { is: `other` })());

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ is: `other` });
  });
});
