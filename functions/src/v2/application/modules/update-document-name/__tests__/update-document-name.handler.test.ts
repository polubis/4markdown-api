import {
  DocumentModel,
  DocumentModelVisibility,
  DocumentsModel,
} from '@domain/models/document';
import { type UpdateDocumentNamePayload } from '../update-document-name.contract';
import { updateDocumentNameHandler } from '../update-document-name.handler';

const stampMock = `2024-12-01T00:00:00Z`;

jest.mock(`@libs/helpers/stamps`, () => ({
  nowISO: jest.fn(() => stampMock),
  uuid: jest.fn(() => `mock-id`),
}));

// @TODO[PRIO=2]: [Prepare fixtures for components testing].
describe(`Document name update works when`, () => {
  const validPayload: UpdateDocumentNamePayload = {
    name: {
      raw: `Test Document For Me`,
      slug: `test-document-for-me`,
      path: `/test-document-for-me/`,
      segments: [`test`, `document`, `for`, `me`],
    },
    id: `document-id`,
    mdate: `2024-01-01T00:00:00Z`,
  };
  const projectId = `project-id`;
  const uid = `user-uid`;

  describe(`throws an error`, () => {
    it(`if there is no documents`, async () => {
      try {
        await updateDocumentNameHandler({
          payload: validPayload,
          context: {
            uid,
            db: {
              collection: () => ({
                doc: () => ({
                  get: async () => ({
                    data: () => undefined,
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toMatchSnapshot();
      }
    });

    it(`if cannot find document`, async () => {
      try {
        await updateDocumentNameHandler({
          payload: validPayload,
          context: {
            uid,
            db: {
              collection: () => ({
                doc: () => ({
                  get: async () => ({
                    data: (): DocumentsModel => ({
                      'not-existing-document': {
                        cdate: `2024-01-01T00:00:00Z`,
                        mdate: `2024-01-01T00:00:00Z`,
                        name: `Example document name`,
                        code: ``,
                        path: `/example-document-name/`,
                        visibility: DocumentModelVisibility.Private,
                      },
                    }),
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toMatchSnapshot();
      }
    });

    it(`if there is out of date change attempt`, async () => {
      try {
        await updateDocumentNameHandler({
          payload: validPayload,
          context: {
            uid,
            db: {
              collection: () => ({
                doc: () => ({
                  get: async () => ({
                    data: (): DocumentsModel => ({
                      [validPayload.id]: {
                        cdate: `2024-01-01T00:00:00Z`,
                        mdate: `2024-04-01T00:00:00Z`,
                        name: `Example document name`,
                        code: ``,
                        path: `example-document-name`,
                        visibility: DocumentModelVisibility.Private,
                      },
                    }),
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toMatchSnapshot();
      }
    });

    it(`if contains duplicate in own documents`, async () => {
      try {
        await updateDocumentNameHandler({
          payload: validPayload,
          context: {
            uid,
            db: {
              collection: () => ({
                doc: () => ({
                  get: async () => ({
                    data: (): DocumentsModel => ({
                      [validPayload.id]: {
                        cdate: `2024-01-01T00:00:00Z`,
                        mdate: `2024-01-01T00:00:00Z`,
                        name: `Test Document For Me-2`,
                        code: ``,
                        path: `/test-document-for-me-2/`,
                        visibility: DocumentModelVisibility.Private,
                      },
                      'other-document-id': {
                        cdate: `2024-01-02T00:00:00Z`,
                        mdate: `2024-01-02T00:00:00Z`,
                        name: `Test Document For Me`,
                        code: ``,
                        path: `/test-document-for-me/`,
                        visibility: DocumentModelVisibility.Private,
                      },
                    }),
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toMatchSnapshot();
      }
    });

    it(`if validation for permanent document name fails`, async () => {
      try {
        await updateDocumentNameHandler({
          payload: {
            ...validPayload,
            name: {
              raw: `Too Short`,
              slug: `too-short`,
              segments: [`too`, `short`],
              path: `/too-short/`,
            },
          },
          context: {
            uid,
            db: {
              collection: () => ({
                doc: () => ({
                  get: async () => ({
                    data: (): DocumentsModel => ({
                      [validPayload.id]: {
                        cdate: `2024-01-01T00:00:00Z`,
                        mdate: `2024-01-01T00:00:00Z`,
                        name: `Test Document With Different Name`,
                        code: ``,
                        path: `/test-document-with-different-name/`,
                        visibility: DocumentModelVisibility.Permanent,
                        description: `Some description of my document`,
                        tags: [`programming`],
                      },
                    }),
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toMatchSnapshot();
      }
    });

    it(`if contains duplicate in permanent documents between different authors`, async () => {
      try {
        await updateDocumentNameHandler({
          payload: validPayload,
          context: {
            uid,
            db: {
              collection: () => ({
                get: () => ({
                  docs: [
                    {
                      data: (): DocumentsModel => ({
                        'other-document-id': {
                          cdate: `2024-01-01T00:00:00Z`,
                          mdate: `2024-01-01T00:00:00Z`,
                          name: `Test Document For Me`,
                          code: ``,
                          path: `/test-document-for-me/`,
                          visibility: DocumentModelVisibility.Permanent,
                          description: `Some description of my document`,
                          tags: [`programming`],
                        },
                      }),
                    },
                  ],
                }),
                doc: () => ({
                  get: async () => ({
                    data: (): DocumentsModel => ({
                      [validPayload.id]: {
                        cdate: `2024-01-01T00:00:00Z`,
                        mdate: `2024-01-01T00:00:00Z`,
                        name: `Test Document For Me`,
                        code: ``,
                        path: `/test-document-for-me/`,
                        visibility: DocumentModelVisibility.Permanent,
                        description: `Some description of my document`,
                        tags: [`programming`],
                      },
                    }),
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  it(`updates documents model and returns dto`, async () => {
    const updateSpy = jest.fn();

    const documentModel: DocumentModel = {
      cdate: `2024-01-01T00:00:00Z`,
      mdate: `2024-01-01T00:00:00Z`,
      name: `Test Document For Me`,
      code: ``,
      path: `/test-document-for-me/`,
      visibility: DocumentModelVisibility.Private,
    };

    const dto = await updateDocumentNameHandler({
      payload: validPayload,
      context: {
        uid,
        db: {
          collection: () => ({
            doc: () => ({
              get: async () => ({
                data: (): DocumentsModel => ({
                  [validPayload.id]: documentModel,
                }),
              }),
              update: updateSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      [validPayload.id]: {
        ...documentModel,
        path: validPayload.name.path,
        name: validPayload.name.raw,
        mdate: stampMock,
      },
    });
    expect(dto).toEqual({ mdate: stampMock, name: validPayload.name.raw });
  });
});
