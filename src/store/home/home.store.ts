import { create } from 'zustand';

export interface HomeMetadata {
  title: string;
  siteUrl: string;
}

export interface HomeIdleState {
  is: 'idle';
}

export interface HomeReadyState extends HomeMetadata {
  is: 'ready';
}

export type HomeState = HomeIdleState | HomeReadyState;

export const useHomeStore = create<HomeState>(() => ({
  is: `idle`,
}));

export const useHomeState = () => {
  return useHomeStore((state) => {
    if (state.is === `idle`)
      throw Error(
        `You forgot to add the useSyncStore hook at the top of your page component`,
      );

    return state;
  });
};
