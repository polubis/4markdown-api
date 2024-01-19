import { Doc } from './doc';

describe(`Doc may be used when: `, () => {
  it(`creates a path`, () => {
    expect(Doc.createPath(`Working with Zustand`)).toBe(
      `/working-with-zustand/`,
    );
  });

  it(`throws an error if invalid name`, () => {
    expect(() => Doc.createPath(`Working-with-Zustand`)).toThrow();
  });

  it(`throws an error if invalid description`, () => {
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
