import { getDocumentCommentsPayloadSchema } from '../get-document-comments.contract';

describe(`Get document comments contract works when`, () => {
  it(`accepts valid payload`, () => {
    expect(() =>
      getDocumentCommentsPayloadSchema.parse({
        document: {
          id: `some-string-id`,
          authorId: `some-string-id`,
        },
      }),
    ).not.toThrow();
  });

  it(`rejects invalid payload`, () => {
    expect(() =>
      getDocumentCommentsPayloadSchema.parse({
        document: {
          id: null,
          authorId: `some-string-id`,
        },
      }),
    ).toThrow();
    expect(() =>
      getDocumentCommentsPayloadSchema.parse({
        document: {
          id: `some-string-id`,
        },
      }),
    ).toThrow();
    expect(() =>
      getDocumentCommentsPayloadSchema.parse({
        document: {
          id: `some-string-id`,
        },
      }),
    ).toThrow();
    expect(() =>
      getDocumentCommentsPayloadSchema.parse({
        documentId: `some-string-id`,
        content: null,
      }),
    ).toThrow();
    expect(() => getDocumentCommentsPayloadSchema.parse({})).toThrow();
    expect(() => getDocumentCommentsPayloadSchema.parse(null)).toThrow();
    expect(() =>
      getDocumentCommentsPayloadSchema.parse({
        documentId: `some-string-id`,
        authorId: ``,
      }),
    ).toThrow();
  });
});
