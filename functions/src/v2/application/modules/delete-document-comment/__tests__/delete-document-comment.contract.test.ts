import { deleteDocumentCommentPayloadSchema } from '../delete-document-comment.contract';

describe(`Delete document comment contract works when`, () => {
  it(`it accepts a valid payload`, () => {
    const validPayload = {
      comment: {
        id: `some-string-id`,
        mdate: `2024-06-17T12:34:56.789Z`,
      },
      document: {
        id: `some-id`,
        authorId: `some-author-id`,
      },
    };

    expect(() =>
      deleteDocumentCommentPayloadSchema.parse(validPayload),
    ).not.toThrow();
  });

  const invalidPayloads = [
    { description: `required fields are missing`, payload: {} },
    { description: `the data is null`, payload: null },
    {
      description: `some fields are incomplete`,
      payload: {
        comment: { ids: `some-string-id`, mdate: `2024-06-17T12:34:56.789Z` },
      },
    },
    {
      description: `a field has invalid data`,
      payload: {
        comment: {
          id: null,
          mdate: `2024-06-17T12:34:56.789Z`,
        },
      },
    },
    {
      description: `unexpected fields are included`,
      payload: {
        comment: {
          id: `some-string-id`,
          mdate: ``,
        },
      },
    },
    {
      description: `fields contain invalid values`,
      payload: {
        comment: {
          id: null,
          mdate: ``,
        },
      },
    },
  ];

  test.each(invalidPayloads)(`it rejects the payload if %s`, ({ payload }) => {
    expect(() => deleteDocumentCommentPayloadSchema.parse(payload)).toThrow();
  });
});
