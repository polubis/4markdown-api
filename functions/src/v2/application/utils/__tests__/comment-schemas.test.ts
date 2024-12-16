import { commentContentSchema } from '../comment-schemas';

describe(`Comment content schema works when`, () => {
  it(`accepts valid comments with 1-250 characters`, () => {
    const validComment = `This is a perfectly valid comment within the character limits.`;
    expect(commentContentSchema.parse(validComment)).toBe(validComment.trim());
  });

  it(`rejects empty comments`, () => {
    const emptyComment = `   `;
    expect(() => commentContentSchema.parse(emptyComment)).toThrow(
      `Content of comment cannot be empty`,
    );
  });

  it(`rejects comments shorter than 1 character`, () => {
    const shortComment = ``;
    expect(() => commentContentSchema.parse(shortComment)).toThrow(
      `Content of comment cannot be empty`,
    );
  });

  it(`rejects comments longer than 250 characters`, () => {
    const longComment = `a`.repeat(251);
    expect(() => commentContentSchema.parse(longComment)).toThrow(
      `Content of comment must be fewer than 250 characters`,
    );
  });

  it(`trims whitespace from valid comments`, () => {
    const commentWithWhitespace = `    This comment has leading and trailing whitespace.   `;
    expect(commentContentSchema.parse(commentWithWhitespace)).toBe(
      commentWithWhitespace.trim(),
    );
  });

  it(`handles edge case for exactly 250 characters`, () => {
    const maxLengthComment = `a`.repeat(250);
    expect(commentContentSchema.parse(maxLengthComment)).toBe(maxLengthComment);
  });

  it(`handles edge case for exactly 1 character`, () => {
    const minLengthComment = `a`;
    expect(commentContentSchema.parse(minLengthComment)).toBe(minLengthComment);
  });

  it(`rejects non-string inputs with appropriate errors`, () => {
    expect(() => commentContentSchema.parse(null)).toThrow(
      `Expected string, received null`,
    );
    expect(() => commentContentSchema.parse(undefined)).toThrow(`Required`);
    expect(() => commentContentSchema.parse(123)).toThrow(
      `Expected string, received number`,
    );
    expect(() => commentContentSchema.parse({})).toThrow(
      `Expected string, received object`,
    );
    expect(() => commentContentSchema.parse([])).toThrow(
      `Expected string, received array`,
    );
  });
});
