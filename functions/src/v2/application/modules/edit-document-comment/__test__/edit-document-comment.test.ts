import { editDocumentCommentPayloadSchema } from '../edit-document-comment.contract';

describe(`Edit document comment contract`, () => {
  it(`accepts a valid payload`, () => {
    const validPayload = {
      document: { id: `some-id`, authorId: `some-id` },
      comment: {
        id: `some-id`,
        content: `a`,
        mdate: `2024-06-17T12:34:56.789Z`,
      },
    };

    expect(() =>
      editDocumentCommentPayloadSchema.parse(validPayload),
    ).not.toThrow();
  });

  const invalidPayloads = [
    { description: `when required fields are missing`, payload: {} },
    { description: `when data is null`, payload: null },
    {
      description: `when fields are invalid`,
      payload: { document: { id: null } },
    },
    {
      description: `when fields are incomplete`,
      payload: { document: { id: `some-id` } },
    },
    {
      description: `when fields are empty`,
      payload: { document: {}, content: `` },
    },
  ];

  test.each(invalidPayloads)(`rejects the payload %s`, ({ payload }) => {
    expect(() => editDocumentCommentPayloadSchema.parse(payload)).toThrow();
  });
});
