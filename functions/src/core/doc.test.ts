import { Doc } from './doc';

describe(`Doc may be used when: `, () => {
  it(`creates name`, () => {
    expect(Doc.createName(`Working with Zustand`, `private`)).toBe(
      `Working with Zustand`,
    );
    expect(() => Doc.createName(`Working-with-Zustand`, `private`)).toThrow();
    expect(Doc.createName(`Test1`, `private`)).toBe(`Test1`);
    expect(() => Doc.createName(`Test1`, `permanent`)).toThrow();
    expect(Doc.createName(`Test1 other test`, `permanent`)).toBe(
      `Test1 other test`,
    );
  });

  it(`creates path`, () => {
    expect(Doc.createPath(`Test siema 3`, `private`)).toBe(`/test-siema-3/`);
    expect(Doc.createPath(`Test 1`, `private`)).toBe(`/test-1/`);
    expect(Doc.createPath(`Test`, `private`)).toBe(`/test/`);
    expect(() => Doc.createPath(`  Test   1    `, `private`)).toThrow();
    expect(() => Doc.createPath(`Working-with-Zustand`, `private`)).toThrow();
    expect(Doc.createPath(`docs`, `private`)).toBe(`/docs/`);
    expect(Doc.createPath(`doc`, `private`)).toBe(`/doc/`);
  });

  it(`creates description`, () => {
    expect(() => Doc.createDescription(`31232-`)).toThrow();
    expect(() =>
      Doc.createDescription(
        `31232- asdasdsada sad asd aad aad asdds a  sdsad asd asd saasda sad sadsa sadasd adsa adsadsasaddddddddddddddd asd asdsad adasas dsadsad dds asd sad asd sadsadsdsa sd dsad asasasdsa sddsa das dasdsadsadas asdsad  dddddddddddddddddddd asd asda sdasd asdasd asdad asd adsad`,
      ),
    ).toThrow();
    expect(() =>
      Doc.createDescription(
        `31232- asdasdsada sad sadsa sadasd adsa adsadsasaddddddddddddddd asd asdsdsaada asds`,
      ),
    ).not.toThrow();
  });
});
