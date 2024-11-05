import {
  documentNameSchema,
  documentCodeSchema,
  documentTagsSchema,
  permanentDocumentNameSegmentsSchema,
} from '../document-schemas';

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
      expect(() => documentNameSchema.parse(`one/two/three`)).not.toThrow();
      expect(() => documentNameSchema.parse(`One/Two`)).not.toThrow();
      expect(() => documentNameSchema.parse(`Single`)).not.toThrow();
      expect(() => documentNameSchema.parse(`x-ad`)).not.toThrow();
      expect(() => documentNameSchema.parse(``)).toThrowError(
        `Generated path from document name must be between 1-15`,
      );
      expect(() => documentNameSchema.parse(`-`)).toThrowError(
        `Generated path from document name must be between 1-15`,
      );
      expect(() => documentNameSchema.parse(`+-`)).toThrowError(
        `Generated path from document name must be between 1-15`,
      );
    });

    it(`rejects paths with too many segments`, () => {
      expect(() =>
        documentNameSchema.parse(
          `one/two/three/four/five/six/seven/eight/nine/ten/eleven/twelve/thirteen/fourteen/fifteen`,
        ),
      ).not.toThrow();
      expect(() =>
        documentNameSchema.parse(
          `one/two/three/four/five/six/seven/eight/nine/ten/eleven/twelve/thirteen/fourteen/fifteen/sixteen`,
        ),
      ).toThrow(`Generated path from document name must be between 1-15`);
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

    it(`handles invalid inputs appropriately`, () => {
      expect(() => documentNameSchema.parse(`!!!???###`)).toThrow(
        `Generated path from document name must be between 1-15`,
      );

      expect(() => documentNameSchema.parse(`   `)).toThrow(
        `Generated path from document name must be between 1-15`,
      );

      expect(documentNameSchema.parse(`a/b`)).toEqual({
        path: `a-b`,
        raw: `a/b`,
        segments: [`a`, `b`],
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

  describe(`tags validation`, () => {
    it(`blocks non-letters and non-numbers values`, () => {
      expect(() => documentTagsSchema.parse([`-`])).toThrowError(
        `Invalid tag format`,
      );
      expect(() => documentTagsSchema.parse([``])).toThrowError(
        `Invalid tag format`,
      );
      expect(() => documentTagsSchema.parse([`+`])).toThrowError(
        `Invalid tag format`,
      );
      expect(() => documentTagsSchema.parse([`>>`])).toThrowError(
        `Invalid tag format`,
      );
      expect(documentTagsSchema.parse([`-x`])).toEqual([`x`]);
      expect(documentTagsSchema.parse([`-a    -`])).toEqual([`a`]);
    });

    it(`typical use cases works`, () => {
      expect(
        documentTagsSchema.parse([
          `react`,
          `validator`,
          `JavaScript`,
          `c++`,
          `c#`,
          `c`,
          `type script`,
          `r`,
          `ruby on rails`,
          `c9`,
        ]),
      ).toEqual([
        `react`,
        `validator`,
        `javascript`,
        `c++`,
        `c#`,
        `c`,
        `type-script`,
        `r`,
        `ruby-on-rails`,
        `c9`,
      ]);
    });

    it(`verifies if there is not duplicates`, () => {
      expect(() => documentTagsSchema.parse([`xa`, `xa`])).toThrowError(
        `Tags must be unique`,
      );
      expect(() => documentTagsSchema.parse([`xa`, `xd`])).not.toThrow();
      expect(() => documentTagsSchema.parse([`c`, `c    `])).toThrowError(
        `Tags must be unique`,
      );
      expect(() =>
        documentTagsSchema.parse([`c++`, `c    `, `c+`]),
      ).toThrowError(`Tags must be unique`);
      expect(() =>
        documentTagsSchema.parse([`c#`, `c    `, `c##`]),
      ).toThrowError(`Tags must be unique`);
    });

    it(`verifies if there is no white spacing around tags`, () => {
      expect(documentTagsSchema.parse([`xds     `])).toEqual([`xds`]);
      expect(documentTagsSchema.parse([`  xd`])).toEqual([`xd`]);
      expect(documentTagsSchema.parse([`x d`])).toEqual([`x-d`]);
      expect(documentTagsSchema.parse([`x-d`])).toEqual([`x-d`]);
    });

    it(`verifies that each tag has 1-50 characters`, () => {
      expect(() => documentTagsSchema.parse([`xda`, ``])).toThrowError(
        `String must contain at least 1 character(s)`,
      );
      expect(() => documentTagsSchema.parse([`c`])).not.toThrow();
    });

    it(`verifies that number of tags is between 1-10`, () => {
      expect(() => documentTagsSchema.parse([])).toThrowError(
        `Array must contain at least 1 element(s)`,
      );
      expect(() =>
        documentTagsSchema.parse([
          `tag1`,
          `tag2`,
          `tag3`,
          `tag4`,
          `tag5`,
          `tag6`,
          `tag7`,
          `tag8`,
          `tag9`,
          `tag10`,
          `tag11`,
        ]),
      ).toThrowError(`Array must contain at most 10 element(s)`);

      expect(() => documentTagsSchema.parse([`tag1`])).not.toThrow();

      expect(() =>
        documentTagsSchema.parse([
          `tag1`,
          `tag2`,
          `tag3`,
          `tag4`,
          `tag5`,
          `tag6`,
          `tag7`,
          `tag8`,
          `tag9`,
          `tag10`,
        ]),
      ).not.toThrow();
    });
  });

  describe(`permanent document name segment validation`, () => {
    it(`accepts valid arrays with length between 3 and 15`, () => {
      expect(
        permanentDocumentNameSegmentsSchema.parse([
          `segment1`,
          `segment2`,
          `segment3`,
        ]),
      ).toEqual([`segment1`, `segment2`, `segment3`]);
      expect(
        permanentDocumentNameSegmentsSchema.parse(Array(15).fill(`segment`)),
      ).toHaveLength(15);
    });

    it(`rejects arrays shorter than the minimum length`, () => {
      expect(() =>
        permanentDocumentNameSegmentsSchema.parse([`one`, `two`]),
      ).toThrowError(`Array must contain at least 3 element(s)`);
    });

    it(`rejects arrays longer than the maximum length`, () => {
      expect(() =>
        permanentDocumentNameSegmentsSchema.parse(Array(16).fill(`segment`)),
      ).toThrowError(`Array must contain at most 15 element(s)`);
    });

    it(`rejects arrays with non-string elements`, () => {
      expect(() =>
        permanentDocumentNameSegmentsSchema.parse([
          `string`,
          123,
          `anotherString`,
        ]),
      ).toThrowError();
      expect(() =>
        permanentDocumentNameSegmentsSchema.parse([
          `string`,
          {},
          `anotherString`,
        ]),
      ).toThrowError();
    });

    it(`handles arrays with exactly minimum and maximum lengths`, () => {
      expect(
        permanentDocumentNameSegmentsSchema.parse([`one`, `two`, `three`]),
      ).toHaveLength(3);
      expect(
        permanentDocumentNameSegmentsSchema.parse(
          Array(15).fill(`validSegment`),
        ),
      ).toHaveLength(15);
    });
  });
});
