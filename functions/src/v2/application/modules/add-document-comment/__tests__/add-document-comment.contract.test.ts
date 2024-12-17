import { addDocumentCommentPayloadSchema } from '../add-document-comment.contract';

describe(`Add document comment contract works when`, () => {
  it(`it accepts a valid payload`, () => {
    const validPayload = {
      document: { id: `some-string-id`, authorId: `some-string-id` },
      content: `a`,
    };

    expect(() =>
      addDocumentCommentPayloadSchema.parse(validPayload),
    ).not.toThrow();
  });

  const invalidPayloads = [
    { description: `required fields are missing`, payload: {} },
    { description: `the data is null`, payload: null },
    {
      description: `some fields are incomplete`,
      payload: { document: { id: `some-string-id` } },
    },
    {
      description: `a field has invalid data`,
      payload: {
        document: { id: null, authorId: `some-string-id` },
        content: `a`,
      },
    },
    {
      description: `a required field is empty`,
      payload: { document: { id: `some-string-id` }, content: `` },
    },
    {
      description: `unexpected fields are included`,
      payload: { documentId: `some-string-id`, content: null },
    },
    {
      description: `fields contain invalid values`,
      payload: { documentId: `some-string-id`, authorId: ``, content: `ds` },
    },
  ];

  test.each(invalidPayloads)(`it rejects the payload if %s`, ({ payload }) => {
    expect(() => addDocumentCommentPayloadSchema.parse(payload)).toThrow();
  });
});
