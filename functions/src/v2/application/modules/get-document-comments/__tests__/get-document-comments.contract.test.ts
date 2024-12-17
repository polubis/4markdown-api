import { getDocumentCommentsPayloadSchema } from '../get-document-comments.contract';

describe(`Get document comments contract`, () => {
  it(`accepts a valid payload`, () => {
    const validPayload = {
      document: { id: `some-string-id`, authorId: `some-string-id` },
    };

    expect(() =>
      getDocumentCommentsPayloadSchema.parse(validPayload),
    ).not.toThrow();
  });

  const invalidPayloads = [
    { description: `when required fields are missing`, payload: {} },
    { description: `when data is null`, payload: null },
    {
      description: `when fields are incomplete`,
      payload: { document: { id: `some-string-id` } },
    },
    {
      description: `when fields are invalid`,
      payload: { document: { id: null, authorId: `some-string-id` } },
    },
    {
      description: `when unexpected fields are present`,
      payload: { documentId: `some-string-id`, content: null },
    },
    {
      description: `when fields are empty`,
      payload: { documentId: `some-string-id`, authorId: `` },
    },
  ];

  test.each(invalidPayloads)(`rejects the payload %s`, ({ payload }) => {
    expect(() => getDocumentCommentsPayloadSchema.parse(payload)).toThrow();
  });
});
