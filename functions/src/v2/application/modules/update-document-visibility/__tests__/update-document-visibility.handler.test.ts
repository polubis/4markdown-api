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
  uuid: jest.fn(() => `mock-id`),
}));

describe(`Document visibility change works when`, () => {
  const validPayload: UpdateDocumentVisibilityPayload = {
    visibility: DocumentModelVisibility.Private,
    id: `document-id`,
    mdate: `2024-01-01T00:00:00Z`,
  };
  const projectId = `project-id`;
  const uid = `user-uid`;

  it(`visibility is changed to private from permanent and some data is removed`, async () => {
    const updateSpy = jest.fn();

    const dto = await updateDocumentVisibilityHandler({
      payload: {
        ...validPayload,
        mdate: `2023-01-01T00:00:00Z`,
      },
      context: {
        uid,
        db: {
          collection: () => ({
            doc: () => ({
              get: async () => ({
                data: (): DocumentsModel => ({
                  [validPayload.id]: {
                    cdate: `2023-01-01T00:00:00Z`,
                    mdate: `2023-01-01T00:00:00Z`,
                    name: `Test Document With Different Name`,
                    code: ``,
                    path: `test-document-with-different-name`,
                    visibility: DocumentModelVisibility.Permanent,
                    description: `Some description of my document`,
                  },
                }),
              }),
              update: updateSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    const expectedUpdatePayload: DocumentsModel = {
      [validPayload.id]: {
        cdate: `2023-01-01T00:00:00Z`,
        mdate: stampMock,
        name: `Test Document With Different Name`,
        code: ``,
        path: `test-document-with-different-name`,
        visibility: DocumentModelVisibility.Private,
      },
    };
    const expectedDto: UpdateDocumentVisibilityDto = {
      ...expectedUpdatePayload[validPayload.id],
      id: validPayload.id,
    };

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(expectedUpdatePayload);
    expect(dto).toEqual(expectedDto);
  });

  describe(`throws an error`, () => {
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
