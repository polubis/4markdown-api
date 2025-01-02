import { createDocumentHandler } from '../create-document.handler';
import {
  CreateDocumentDto,
  CreateDocumentPayload,
} from '../create-document.contract';
import {
  DocumentModelVisibility,
  DocumentsModel,
} from '@domain/models/document';

jest.mock(`@libs/helpers/stamps`, () => ({
  nowISO: jest.fn(() => `2024-01-01T00:00:00Z`),
  uuid: jest.fn(() => `mock-id`),
}));

describe(`Document creation works when`, () => {
  const validPayload: CreateDocumentPayload = {
    name: {
      raw: `Test Document For Me`,
      slug: `test-document-for-me`,
      path: `/test-document-for-me/`,
      segments: [`test`, `document`, `for`, `me`],
    },
    code: `console.log("test")`,
  };
  const projectId = `project-id`;
  const uid = `user-uid`;

  const validDto: CreateDocumentDto = {
    id: `mock-id`,
    authorId: uid,
    cdate: `2024-01-01T00:00:00Z`,
    mdate: `2024-01-01T00:00:00Z`,
    name: validPayload.name.raw,
    code: validPayload.code,
    path: validPayload.name.path,
    visibility: DocumentModelVisibility.Private,
  };

  it(`creates first document via "set" function from db provider and ignores "update"`, async () => {
    const setSpy = jest.fn();
    const updateSpy = jest.fn();

    const result = await createDocumentHandler({
      payload: validPayload,
      context: {
        uid,
        db: {
          collection: () => ({
            doc: () => ({
              get: async () => ({
                data: () => undefined,
              }),
              set: setSpy,
              update: updateSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, authorId, ...documentModel } = validDto;
    const documentsModel: DocumentsModel = {
      [id]: documentModel,
    };

    expect(result).toEqual(validDto);
    expect(setSpy).toHaveBeenCalledWith(documentsModel);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it(`throws an error when document with provided name exist`, async () => {
    const { id, ...documentModel } = validDto;
    const documentsModel: DocumentsModel = {
      [id]: documentModel,
    };

    try {
      await createDocumentHandler({
        payload: validPayload,
        context: {
          uid,
          db: {
            collection: () => ({
              doc: () => ({
                get: async () => ({
                  data: () => documentsModel,
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

  it(`adds new document to existing documents collection`, async () => {
    const setSpy = jest.fn();
    const updateSpy = jest.fn();

    const result = await createDocumentHandler({
      payload: validPayload,
      context: {
        uid,
        db: {
          collection: () => ({
            doc: () => ({
              get: async () => ({
                data: () => ({
                  'random-id': {
                    id: `mock-id-2`,
                    cdate: `2024-01-01T00:00:00Z`,
                    mdate: `2024-01-01T00:00:00Z`,
                    name: `My custom document name`,
                    code: `empty code`,
                    path: `/my-custom-document-name/`,
                    visibility: `private`,
                  },
                }),
              }),
              set: setSpy,
              update: updateSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, authorId, ...documentModel } = validDto;
    const documentsModel: DocumentsModel = {
      [id]: documentModel,
    };

    expect(result).toEqual(validDto);
    expect(setSpy).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith(documentsModel);
  });
});
