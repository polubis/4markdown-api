import { addDocumentCommentPayloadSchema } from '../add-document-comment.contract';

describe(`Add document comment contract works when`, () => {
  it(`accepts valid payload`, () => {
    expect(() =>
      addDocumentCommentPayloadSchema.parse({
        documentId: `some-string-id`,
        authorId: `some-string-id`,
        content: `a`,
      }),
    ).not.toThrow();
  });

  it(`rejects invalid payload`, () => {
    expect(() =>
      addDocumentCommentPayloadSchema.parse({
        documentId: null,
      }),
    ).toThrow();
    expect(() =>
      addDocumentCommentPayloadSchema.parse({
        documentId: `some-string-id`,
      }),
    ).toThrow();
    expect(() =>
      addDocumentCommentPayloadSchema.parse({
        documentId: `some-string-id`,
        content: ``,
      }),
    ).toThrow();
    expect(() =>
      addDocumentCommentPayloadSchema.parse({
        documentId: `some-string-id`,
        content: null,
      }),
    ).toThrow();
    expect(() => addDocumentCommentPayloadSchema.parse({})).toThrow();
    expect(() => addDocumentCommentPayloadSchema.parse(null)).toThrow();
    expect(() =>
      addDocumentCommentPayloadSchema.parse({
        documentId: `some-string-id`,
        authorId: ``,
        content: `ds`,
      }),
    ).toThrow();
  });
});
