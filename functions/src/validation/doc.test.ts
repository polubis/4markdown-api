import { docValidators } from './doc';

describe(`Name validation works when: `, () => {
  it(`validates name format`, () => {
    expect(docValidators.name(`My new document`)).toBe(true);
    expect(docValidators.name(`My new document2`)).toBe(true);
    expect(docValidators.name(`My-new`)).toBe(false);
    expect(docValidators.name(`My----new`)).toBe(false);
    expect(docValidators.name(`My new `)).toBe(false);
    expect(docValidators.name(` My asda     new `)).toBe(false);
    expect(docValidators.name(` My new `)).toBe(false);
    expect(docValidators.name(`My  new`)).toBe(false);
    expect(docValidators.name(undefined)).toBe(false);
  });

  it(`allows min 2 characters`, () => {
    expect(docValidators.name(`My`)).toBe(true);
    expect(docValidators.name(`M`)).toBe(false);
  });

  it(`allows max 100 characters`, () => {
    expect(
      docValidators.name(`qweqweqweq qweqweqweq qweqweqweq qweqweqweq qweqw`),
    ).toBe(true);
    expect(
      docValidators.name(
        `qweqweqweq qweqweqweq qweqweqweq qweqweqweq qweqweqweq qweqweqweq qweqweqweq qweqweqweq qweqweqweq qweqweqweq 1`,
      ),
    ).toBe(false);
  });
});
