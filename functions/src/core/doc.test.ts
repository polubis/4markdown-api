import { Doc } from './doc';

describe(`Doc may be used when: `, () => {
  it(`creates a path`, () => {
    expect(Doc.createPath(`31232-dasdad-3123`, `Working with Zustand`)).toBe(
      `/31232-dasdad-3123/working-with-zustand/`,
    );
  });

  it(`throws an error if invalid name`, () => {
    expect(() =>
      Doc.createPath(`31232-dasdad-3123`, `Working-with-Zustand`),
    ).toThrow();
  });
});
