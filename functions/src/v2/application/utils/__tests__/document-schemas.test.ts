import {
  documentNameSchema,
  documentCodeSchema,
} from '@utils/document-schemas';

describe(`Document schemas works when`, () => {
  describe(`name validation`, () => {
    it(`accepts valid names and generates correct paths with segments`, () => {
      expect(documentNameSchema.parse(`Hello world test`)).toEqual({
        raw: `Hello world test`,
        path: `hello-world-test`,
        segments: [`hello`, `world`, `test`],
      });

      expect(documentNameSchema.parse(`Hello/World/Test`)).toEqual({
        raw: `Hello/World/Test`,
        path: `hello-world-test`,
        segments: [`hello`, `world`, `test`],
      });

      expect(documentNameSchema.parse(`  One/Two/Three  `)).toEqual({
        raw: `One/Two/Three`,
        path: `one-two-three`,
        segments: [`one`, `two`, `three`],
      });

      expect(documentNameSchema.parse(`Test/123/Path`)).toEqual({
        raw: `Test/123/Path`,
        path: `test-123-path`,
        segments: [`test`, `123`, `path`],
      });
    });

    it(`rejects paths with too few segments`, () => {
      expect(() => documentNameSchema.parse(`One/Two`)).toThrow(
        `Generated path from document name must be between 3-15`,
      );
      expect(() => documentNameSchema.parse(`Single`)).toThrow(
        `Generated path from document name must be between 3-15`,
      );
      expect(() => documentNameSchema.parse(`x-ad`)).toThrow(
        `Generated path from document name must be between 3-15`,
      );
    });

    it(`rejects paths with too many segments`, () => {
      const longPath = `one/two/three/four/five/six/seven/eight/nine/ten/eleven/twelve/thirteen/fourteen/fifteen/sixteen`;
      expect(() => documentNameSchema.parse(longPath)).toThrow(
        `Generated path from document name must be between 3-15`,
      );
    });

    it(`normalizes special characters in paths while preserving segments`, () => {
      expect(documentNameSchema.parse(`Hello & World/Test!/Now`)).toEqual({
        raw: `Hello & World/Test!/Now`,
        path: `hello-world-test-now`,
        segments: [`hello`, `world`, `test`, `now`],
      });

      expect(documentNameSchema.parse(`Test@123/Path#1/Final`)).toEqual({
        raw: `Test@123/Path#1/Final`,
        path: `test-123-path-1-final`,
        segments: [`test`, `123`, `path`, `1`, `final`],
      });

      expect(documentNameSchema.parse(`Café/Menu/Items`)).toEqual({
        raw: `Café/Menu/Items`,
        path: `cafe-menu-items`,
        segments: [`cafe`, `menu`, `items`],
      });
    });

    it(`handles whitespace correctly while maintaining segments`, () => {
      expect(documentNameSchema.parse(`  First/  Second  /Third  `)).toEqual({
        raw: `First/  Second  /Third`,
        path: `first-second-third`,
        segments: [`first`, `second`, `third`],
      });

      expect(documentNameSchema.parse(`\tOne/Two/Three\t`)).toEqual({
        raw: `One/Two/Three`,
        path: `one-two-three`,
        segments: [`one`, `two`, `three`],
      });
    });
  });

  describe(`code validation`, () => {
    it(`accepts string content`, () => {
      expect(documentCodeSchema.parse(`const x = 1;`)).toBe(`const x = 1;`);
      expect(documentCodeSchema.parse(``)).toBe(``);
      expect(documentCodeSchema.parse(`// comment`)).toBe(`// comment`);
      expect(documentCodeSchema.parse(`function test() {}`)).toBe(
        `function test() {}`,
      );
    });

    it(`rejects invalid content types`, () => {
      expect(() => documentCodeSchema.parse(123)).toThrow();
      expect(() => documentCodeSchema.parse(null)).toThrow();
      expect(() => documentCodeSchema.parse(undefined)).toThrow();
      expect(() => documentCodeSchema.parse({})).toThrow();
      expect(() => documentCodeSchema.parse([])).toThrow();
    });
  });

  describe(`boundary cases`, () => {
    it(`handles invalid inputs appropriately`, () => {
      expect(() => documentNameSchema.parse(`!!!???###`)).toThrow(
        `Generated path from document name must be between 3-15`,
      );

      expect(() => documentNameSchema.parse(`   `)).toThrow(
        `Generated path from document name must be between 3-15`,
      );

      expect(() => documentNameSchema.parse(`a/b`)).toThrow(
        `Generated path from document name must be between 3-15`,
      );
    });
  });
});
