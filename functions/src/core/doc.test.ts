import { Doc } from './doc';

describe(`Doc may be used when: `, () => {
  it(`creates name`, () => {
    expect(Doc.createName(`Working with Zustand`)).toBe(`Working with Zustand`);
    expect(() => Doc.createName(`Working-with-Zustand`)).toThrow();
    expect(Doc.createName(`Test1`)).toBe(`Test1`);
  });

  it(`creates path`, () => {
    expect(Doc.createPath(`Test siema 3`)).toBe(`/test-siema-3/`);
    expect(Doc.createPath(`Test 1`)).toBe(`/test-1/`);
    expect(Doc.createPath(`Test`)).toBe(`/test/`);
    expect(() => Doc.createPath(`  Test   1    `)).toThrow();
    expect(() => Doc.createPath(`Working-with-Zustand`)).toThrow();
    expect(() => Doc.createPath(`docs`)).toThrow();
    expect(() => Doc.createPath(`doc`)).toThrow();
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
