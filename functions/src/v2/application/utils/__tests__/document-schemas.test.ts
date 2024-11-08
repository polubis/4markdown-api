import {
  documentNameSchema,
  documentCodeSchema,
  documentTagsSchema,
  permanentDocumentNameSegmentsSchema,
  documentDescriptionSchema,
} from '../document-schemas';

describe(`Document schemas works when`, () => {
  describe(`description validation`, () => {
    it(`accepts a valid description with 50-250 characters`, () => {
      const description = `This is a valid description with exactly the minimum length required by the schema, totaling fifty characters.`;
      expect(documentDescriptionSchema.parse(description)).toBe(
        description.trim(),
      );
    });

    it(`rejects a description shorter than 110 characters`, () => {
      const shortDescription = `Too short.`;
      expect(() => documentDescriptionSchema.parse(shortDescription)).toThrow(
        `Description must be at least 110 characters`,
      );
    });

    it(`rejects a description longer than 160 characters`, () => {
      const longDescription = `a`.repeat(161);
      expect(() => documentDescriptionSchema.parse(longDescription)).toThrow(
        `Description must be fewer than 160 characters`,
      );
    });

    it(`trims whitespace from a valid description`, () => {
      const descriptionWithWhitespace = `    This is a description with leading and trailing whitespace that should be trimmed by the schema. should be trimmed by should be trimmed by    `;
      expect(documentDescriptionSchema.parse(descriptionWithWhitespace)).toBe(
        descriptionWithWhitespace.trim(),
      );
    });
  });

  describe(`name validation`, () => {
    it(`verifies total length`, () => {
      expect(() => documentNameSchema.parse(`a`.repeat(160))).not.toThrow();
      expect(() => documentNameSchema.parse(`a`.repeat(161))).toThrow(
        `Name must be between 1-160 characters`,
      );
      expect(() => documentNameSchema.parse(``)).toThrow(
        `Generated path from document name must be between 1-15`,
      );
    });

    it(`accepts valid names and generates correct paths with segments`, () => {
      expect(documentNameSchema.parse(`Hello world test`)).toEqual({
        raw: `Hello world test`,
        path: `/hello-world-test/`,
        slug: `hello-world-test`,
        segments: [`hello`, `world`, `test`],
      });

      expect(documentNameSchema.parse(`Hello/World/Test`)).toEqual({
        raw: `Hello/World/Test`,
        path: `/hello-world-test/`,
        slug: `hello-world-test`,
        segments: [`hello`, `world`, `test`],
      });

      expect(documentNameSchema.parse(`  One/Two/Three  `)).toEqual({
        raw: `One/Two/Three`,
        path: `/one-two-three/`,
        slug: `one-two-three`,
        segments: [`one`, `two`, `three`],
      });

      expect(documentNameSchema.parse(`Test/123/Path`)).toEqual({
        raw: `Test/123/Path`,
        slug: `test-123-path`,
        path: `/test-123-path/`,
        segments: [`test`, `123`, `path`],
      });
    });

    it(`rejects paths with too few segments`, () => {
      expect(() => documentNameSchema.parse(`one/two/three`)).not.toThrow();
      expect(() => documentNameSchema.parse(`One/Two`)).not.toThrow();
      expect(() => documentNameSchema.parse(`Single`)).not.toThrow();
      expect(() => documentNameSchema.parse(`x-ad`)).not.toThrow();
      expect(() => documentNameSchema.parse(``)).toThrow(
        `Generated path from document name must be between 1-15`,
      );
      expect(() => documentNameSchema.parse(`-`)).toThrow(
        `Generated path from document name must be between 1-15`,
      );
      expect(() => documentNameSchema.parse(`+-`)).toThrow(
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
        path: `/hello-world-test-now/`,
        slug: `hello-world-test-now`,
        segments: [`hello`, `world`, `test`, `now`],
      });

      expect(documentNameSchema.parse(`Test@123/Path#1/Final`)).toEqual({
        raw: `Test@123/Path#1/Final`,
        slug: `test-123-path-1-final`,
        path: `/test-123-path-1-final/`,
        segments: [`test`, `123`, `path`, `1`, `final`],
      });

      expect(documentNameSchema.parse(`Café/Menu/Items`)).toEqual({
        raw: `Café/Menu/Items`,
        path: `/cafe-menu-items/`,
        slug: `cafe-menu-items`,
        segments: [`cafe`, `menu`, `items`],
      });
    });

    it(`handles whitespace correctly while maintaining segments`, () => {
      expect(documentNameSchema.parse(`  First/  Second  /Third  `)).toEqual({
        raw: `First/  Second  /Third`,
        slug: `first-second-third`,
        path: `/first-second-third/`,
        segments: [`first`, `second`, `third`],
      });

      expect(documentNameSchema.parse(`\tOne/Two/Three\t`)).toEqual({
        raw: `One/Two/Three`,
        slug: `one-two-three`,
        path: `/one-two-three/`,
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
        slug: `a-b`,
        raw: `a/b`,
        path: `/a-b/`,
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
      expect(() => documentTagsSchema.parse([`-`])).toThrow(
        `One of the tags has an invalid format`,
      );
      expect(() => documentTagsSchema.parse([``])).toThrow(
        `One of the tags has an invalid format`,
      );
      expect(() => documentTagsSchema.parse([`+`])).toThrow(
        `One of the tags has an invalid format`,
      );
      expect(() => documentTagsSchema.parse([`>>`])).toThrow(
        `One of the tags has an invalid format`,
      );
      expect(documentTagsSchema.parse([`-x`])).toEqual([`x`]);
      expect(documentTagsSchema.parse([`-a    -`])).toEqual([`a`]);
      expect(documentTagsSchema.parse([`invalid-tag-@`])).toEqual([
        `invalid-tag`,
      ]);
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
      expect(() => documentTagsSchema.parse([`xa`, `xa`])).toThrow(
        `Tags contain duplicates`,
      );
      expect(() => documentTagsSchema.parse([`xa`, `xd`])).not.toThrow();
      expect(() => documentTagsSchema.parse([`c`, `c    `])).toThrow(
        `Tags contain duplicates`,
      );
      expect(() => documentTagsSchema.parse([`c++`, `c    `, `c+`])).toThrow(
        `Tags contain duplicates`,
      );
      expect(() => documentTagsSchema.parse([`c#`, `c    `, `c##`])).toThrow(
        `Tags contain duplicates`,
      );
    });

    it(`verifies if there is no white spacing around tags`, () => {
      expect(documentTagsSchema.parse([`xds     `])).toEqual([`xds`]);
      expect(documentTagsSchema.parse([`  xd`])).toEqual([`xd`]);
      expect(documentTagsSchema.parse([`x d`])).toEqual([`x-d`]);
      expect(documentTagsSchema.parse([`x-d`])).toEqual([`x-d`]);
    });

    it(`verifies that each tag has 1-50 characters`, () => {
      expect(() => documentTagsSchema.parse([`xda`, ``])).toThrow(
        `Tag must be at least 1 character`,
      );
      expect(() => documentTagsSchema.parse([`c`])).not.toThrow();
    });

    it(`verifies that number of tags is between 1-10`, () => {
      expect(() => documentTagsSchema.parse([])).toThrow(
        `At least 1 tag is required`,
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
      ).toThrow(`No more than 10 tags are allowed`);

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
      ).toThrow(`Array must contain at least 3 element(s)`);
    });

    it(`rejects arrays longer than the maximum length`, () => {
      expect(() =>
        permanentDocumentNameSegmentsSchema.parse(Array(16).fill(`segment`)),
      ).toThrow(`Array must contain at most 15 element(s)`);
    });

    it(`rejects arrays with non-string elements`, () => {
      expect(() =>
        permanentDocumentNameSegmentsSchema.parse([
          `string`,
          123,
          `anotherString`,
        ]),
      ).toThrow();
      expect(() =>
        permanentDocumentNameSegmentsSchema.parse([
          `string`,
          {},
          `anotherString`,
        ]),
      ).toThrow();
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
