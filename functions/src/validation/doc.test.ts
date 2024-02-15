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

describe(`Tags validation works when: `, () => {
  it(`validates tags format`, () => {
    expect(docValidators.tags([`react`, `angular`])).toBe(true);
    expect(docValidators.tags([`react`, `react`])).toBe(false);
    expect(docValidators.tags([`react`, `react `])).toBe(false);
    expect(docValidators.tags([`r`, `react `])).toBe(false);
    expect(docValidators.tags([])).toBe(false);
    expect(docValidators.tags([`react`])).toBe(true);
    expect(docValidators.tags([`react-dasdasd`])).toBe(true);
    expect(docValidators.tags([`react/dasdasd`])).toBe(false);
    expect(
      docValidators.tags([
        `re`,
        `an`,
        `vu`,
        `ds`,
        `da`,
        `dg`,
        `dd`,
        `dde`,
        `dsd`,
        `dasd`,
      ]),
    ).toBe(true);
    expect(
      docValidators.tags([
        `re`,
        `an`,
        `vu`,
        `ds`,
        `da`,
        `dg`,
        `dd`,
        `dde`,
        `dsd`,
        `dasd`,
        `dsd`,
      ]),
    ).toBe(false);
    expect(
      docValidators.tags([
        `react`,
        `reactddddddddddddddddddddddddddddddddddddddddddddddddddddddddd`,
      ]),
    ).toBe(false);
  });
});
