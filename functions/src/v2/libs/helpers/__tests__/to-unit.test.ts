import { toUnit } from '../to-unit';

describe(`Converting data sizes works when converts`, () => {
  it(`bytes to bytes`, () => {
    const result = toUnit(1024, `b`);
    expect(result).toBe(1024);
  });

  it(`converts bytes to kilobytes`, () => {
    const result = toUnit(1024, `kb`);
    expect(result).toBe(1.0);
  });

  it(`bytes to megabytes`, () => {
    const result = toUnit(1048576, `mb`);
    expect(result).toBe(1.0);
  });

  it(`bytes to gigabytes`, () => {
    const result = toUnit(1073741824, `gb`);
    expect(result).toBe(1.0);
  });

  it(`bytes to terabytes`, () => {
    const result = toUnit(1099511627776, `tb`);
    expect(result).toBe(1.0);
  });

  it(`larger byte values to kilobytes`, () => {
    const result = toUnit(2048, `kb`);
    expect(result).toBe(2.0);
  });

  it(`larger byte values to megabytes`, () => {
    const result = toUnit(2097152, `mb`);
    expect(result).toBe(2.0);
  });

  it(`handles unsupported conversion formats`, () => {
    expect(() => toUnit(1024, `dx` as any)).toThrow(
      `Unsupported conversion format: dx`,
    );
  });
});
