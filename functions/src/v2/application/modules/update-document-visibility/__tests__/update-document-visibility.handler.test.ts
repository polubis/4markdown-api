import {
  DocumentModelVisibility,
  DocumentsModel,
} from '@domain/models/document';
import { updateDocumentVisibilityHandler } from '../update-document-visibility.handler';
import {
  UpdateDocumentVisibilityDto,
  UpdateDocumentVisibilityPayload,
} from '../update-document-visibility.contract';

const stampMock = `2024-12-01T00:00:00Z`;

jest.mock(`@libs/helpers/stamps`, () => ({
  nowISO: jest.fn(() => stampMock),
}));

describe(`Document visibility change works when`, () => {
  const validPayload: UpdateDocumentVisibilityPayload = {
    visibility: DocumentModelVisibility.Private,
    id: `document-id`,
    mdate: `2024-01-01T00:00:00Z`,
  };
  const projectId = `project-id`;
  const uid = `user-uid`;

  it(`visibility is changed to permanent`, async () => {
    const yourDocumentId = `document-id`;
    const otherDocumentId = `other-id`;
    const mdate = `2023-01-01T00:00:00Z`;

    const yourDocuments: DocumentsModel = {
      [yourDocumentId]: {
        cdate: mdate,
        mdate,
        name: `Test Document With Different Name`,
        code: ``,
        path: `/test-document-with-different-name/`,
        visibility: DocumentModelVisibility.Private,
      },
    };
    const othersDocuments: DocumentsModel = {
      [otherDocumentId]: {
        cdate: `2024-01-01T00:00:00Z`,
        mdate: `2024-01-01T00:00:00Z`,
        name: `Test Document For Me`,
        code: `My Code`,
        path: `/test-document-for-me/`,
        visibility: DocumentModelVisibility.Permanent,
        description: `My own name description that meets validation standards and not throwing exception`,
        tags: [`self-improvement`],
      },
    };

    const payload: Exclude<
      UpdateDocumentVisibilityPayload,
      { visiblity: DocumentModelVisibility.Permanent }
    > = {
      visibility: DocumentModelVisibility.Permanent,
      id: yourDocumentId,
      mdate,
      name: {
        raw: `My Totally New Document`,
        path: `/my-totally-new-document/`,
        slug: `my-totally-new-document`,
        segments: [`my`, `totally`, `new`, `document`],
      },
      description: `My own name description that meets validation standards and not throwing exception`,
      tags: [`programming`],
    };

    const updateSpy = jest.fn();

    const dto = await updateDocumentVisibilityHandler({
      payload,
      context: {
        uid,
        db: {
          collection: () => ({
            get: () => ({
              docs: [
                {
                  data: () => othersDocuments,
                },
              ],
            }),
            doc: () => ({
              get: async () => ({
                data: () => yourDocuments,
              }),
              update: updateSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    const expectedUpdatePayload: DocumentsModel = {
      [yourDocumentId]: {
        cdate: yourDocuments[yourDocumentId].cdate,
        mdate: stampMock,
        name: payload.name.raw,
        code: yourDocuments[yourDocumentId].code,
        path: payload.name.path,
        visibility: DocumentModelVisibility.Permanent,
        description: payload.description,
        tags: payload.tags,
      },
    };
    const expectedDto: UpdateDocumentVisibilityDto = {
      ...expectedUpdatePayload[yourDocumentId],
      id: yourDocumentId,
    };

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(expectedUpdatePayload);
    expect(dto).toEqual(expectedDto);
  });

  it(`visibility is changed to public from permanent and some data is removed`, async () => {
    const updateSpy = jest.fn();
    const id = `document-id`;
    const mdate = `2023-01-01T00:00:00Z`;
    const yourDocuments: DocumentsModel = {
      [id]: {
        cdate: `2023-01-01T00:00:00Z`,
        mdate: `2023-01-01T00:00:00Z`,
        name: `Test Document With Different Name`,
        code: ``,
        path: `/test-document-with-different-name/`,
        visibility: DocumentModelVisibility.Permanent,
        description: `Some description of my document`,
        tags: [`programming`],
      },
    };

    const dto = await updateDocumentVisibilityHandler({
      payload: {
        visibility: DocumentModelVisibility.Public,
        id,
        mdate,
      },
      context: {
        uid,
        db: {
          collection: () => ({
            doc: () => ({
              get: async () => ({
                data: () => yourDocuments,
              }),
              update: updateSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    const expectedUpdatePayload: DocumentsModel = {
      [id]: {
        cdate: yourDocuments[id].cdate,
        mdate: stampMock,
        name: yourDocuments[id].name,
        code: yourDocuments[id].code,
        path: yourDocuments[id].path,
        visibility: DocumentModelVisibility.Public,
      },
    };
    const expectedDto: UpdateDocumentVisibilityDto = {
      ...expectedUpdatePayload[id],
      id,
    };

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(expectedUpdatePayload);
    expect(dto).toEqual(expectedDto);
  });

  it(`visibility is changed to private from permanent and some data is removed`, async () => {
    const updateSpy = jest.fn();
    const id = `document-id`;
    const mdate = `2023-01-01T00:00:00Z`;
    const yourDocuments: DocumentsModel = {
      [id]: {
        cdate: `2023-01-01T00:00:00Z`,
        mdate: `2023-01-01T00:00:00Z`,
        name: `Test Document With Different Name`,
        code: ``,
        path: `/test-document-with-different-name/`,
        visibility: DocumentModelVisibility.Permanent,
        description: `Some description of my document`,
        tags: [`programming`],
      },
    };

    const dto = await updateDocumentVisibilityHandler({
      payload: {
        visibility: DocumentModelVisibility.Private,
        id,
        mdate,
      },
      context: {
        uid,
        db: {
          collection: () => ({
            doc: () => ({
              get: async () => ({
                data: () => yourDocuments,
              }),
              update: updateSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    const expectedUpdatePayload: DocumentsModel = {
      [id]: {
        cdate: yourDocuments[id].cdate,
        mdate: stampMock,
        name: yourDocuments[id].name,
        code: yourDocuments[id].code,
        path: yourDocuments[id].path,
        visibility: DocumentModelVisibility.Private,
      },
    };
    const expectedDto: UpdateDocumentVisibilityDto = {
      ...expectedUpdatePayload[id],
      id,
    };

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(expectedUpdatePayload);
    expect(dto).toEqual(expectedDto);
  });

  describe(`throws an error`, () => {
    it(`if there is unsupported visibility passed`, async () => {
      const id = `document-id`;
      const mdate = `2023-01-01T00:00:00Z`;
      const yourDocuments: DocumentsModel = {
        [id]: {
          cdate: `2023-01-01T00:00:00Z`,
          mdate,
          name: `Test Document With Different Name`,
          code: ``,
          path: `/test-document-with-different-name/`,
          visibility: DocumentModelVisibility.Permanent,
          description: `Some description of my document`,
          tags: [`programming`],
        },
      };

      try {
        await updateDocumentVisibilityHandler({
          payload: {
            mdate,
            id,
            visibility: `unsupported` as any,
          },
          context: {
            uid,
            db: {
              collection: () => ({
                doc: () => ({
                  get: async () => ({
                    data: () => yourDocuments,
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toEqual(
          Error(
            JSON.stringify({
              symbol: `bad-request`,
              content: `Unsupported visibility`,
              message: `Unsupported visibility`,
            }),
          ),
        );
      }
    });

    it(`if there is duplicate in permanent documents`, async () => {
      const yourDocumentId = `document-id`;
      const otherDocumentId = `other-id`;
      const mdate = `2023-01-01T00:00:00Z`;

      const yourDocuments: DocumentsModel = {
        [yourDocumentId]: {
          cdate: mdate,
          mdate,
          name: `Test Document With Different Name`,
          code: ``,
          path: `/test-document-with-different-name/`,
          visibility: DocumentModelVisibility.Permanent,
          description: `Some description of my document`,
          tags: [`programming`],
        },
      };
      const othersDocuments: DocumentsModel = {
        [otherDocumentId]: {
          cdate: `2024-01-01T00:00:00Z`,
          mdate: `2024-01-01T00:00:00Z`,
          name: `Test Document For Me`,
          code: `My Code`,
          path: `/test-document-for-me/`,
          visibility: DocumentModelVisibility.Permanent,
          description: `My own name description that meets validation standards and not throwing exception`,
          tags: [`self-improvement`],
        },
      };

      const payload: UpdateDocumentVisibilityPayload = {
        visibility: DocumentModelVisibility.Permanent,
        id: yourDocumentId,
        mdate,
        name: {
          raw: `Test Document For Me`,
          path: `/test-document-for-me/`,
          slug: `test-document-for-me`,
          segments: [`test`, `document`, `for`, `me`],
        },
        description: `My own name description that meets validation standards and not throwing exception`,
        tags: [`programming`],
      };

      try {
        await updateDocumentVisibilityHandler({
          payload,
          context: {
            uid,
            db: {
              collection: () => ({
                get: () => ({
                  docs: [
                    {
                      data: () => othersDocuments,
                    },
                  ],
                }),
                doc: () => ({
                  get: async () => ({
                    data: () => yourDocuments,
                  }),
                }),
              }),
            } as any,
            projectId,
          },
        });
      } catch (error: unknown) {
        expect(error).toEqual(
          Error(
            JSON.stringify({
              symbol: `already-exists`,
              content: `Document with provided name already exists, please change name`,
              message: `Document with provided name already exists, please change name`,
            }),
          ),
        );
      }
    });

    it(`if there is no documents`, async () => {
      try {
        await updateDocumentVisibilityHandler({
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
        expect(error).toEqual(
          Error(
            JSON.stringify({
              symbol: `not-found`,
              content: `Document data not found`,
              message: `Document data not found`,
            }),
          ),
        );
      }
    });

    it(`if cannot find document`, async () => {
      try {
        await updateDocumentVisibilityHandler({
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
        expect(error).toEqual(
          Error(
            JSON.stringify({
              symbol: `not-found`,
              content: `Document not found`,
              message: `Document not found`,
            }),
          ),
        );
      }
    });

    it(`if there is out of date change attempt`, async () => {
      try {
        await updateDocumentVisibilityHandler({
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
        expect(error).toEqual(
          Error(
            JSON.stringify({
              symbol: `out-of-date`,
              content: `The document has been already changed`,
              message: `The document has been already changed`,
            }),
          ),
        );
      }
    });
  });
});
