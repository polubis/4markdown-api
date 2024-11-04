import { type UpdateDocumentNamePayload } from '../update-document-name.contract';
import { updateDocumentNameHandler } from '../update-document-name.handler';

jest.mock(`@libs/helpers/stamps`, () => ({
  nowISO: jest.fn(() => `2024-01-01T00:00:00Z`),
  uuid: jest.fn(() => `mock-id`),
}));

describe(`Document name update works when`, () => {
  const validPayload: UpdateDocumentNamePayload = {
    name: {
      raw: `Test Document For Me`,
      path: `test-document-for-me`,
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
                    data: () => ({
                      'not-existing-document': {
                        cdate: `2024-01-01T00:00:00Z`,
                        mdate: `2024-01-01T00:00:00Z`,
                        name: `Example document name`,
                        code: ``,
                        path: `example-document-name`,
                        visibility: `private`,
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
                    data: () => ({
                      [validPayload.id]: {
                        cdate: `2024-01-01T00:00:00Z`,
                        mdate: `2024-04-01T00:00:00Z`,
                        name: `Example document name`,
                        code: ``,
                        path: `example-document-name`,
                        visibility: `private`,
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

  //   it(`throws an error when document with provided name exist`, async () => {
  //     const { id, ...documentModel } = validDto;
  //     const documentsModel: DocumentsModel = {
  //       [id]: documentModel,
  //     };

  //   try {
  //     await createDocumentHandler({
  //       payload: validPayload,
  //       context: {
  //         uid,
  //         db: {
  //           collection: () => ({
  //             doc: () => ({
  //               get: async () => ({
  //                 data: () => documentsModel,
  //               }),
  //             }),
  //           }),
  //         } as any,
  //         projectId,
  //       },
  //     });
  //   } catch (error: unknown) {
  //     expect(error).toMatchSnapshot();
  //   }
  //   });

  //   it(`adds new document to existing documents collection`, async () => {
  //     const setSpy = jest.fn();
  //     const updateSpy = jest.fn();

  //     const result = await createDocumentHandler({
  //       payload: validPayload,
  //       context: {
  //         uid,
  //         db: {
  //           collection: () => ({
  //             doc: () => ({
  //               get: async () => ({
  //                 data: () => ({
  //                   'random-id': {
  //                     id: `mock-id-2`,
  //                     cdate: `2024-01-01T00:00:00Z`,
  //                     mdate: `2024-01-01T00:00:00Z`,
  //                     name: `My custom document name`,
  //                     code: `empty code`,
  //                     path: `my-custom-document-name`,
  //                     visibility: `private`,
  //                   },
  //                 }),
  //               }),
  //               set: setSpy,
  //               update: updateSpy,
  //             }),
  //           }),
  //         } as any,
  //         projectId,
  //       },
  //     });

  //     const { id, ...documentModel } = validDto;
  //     const documentsModel: DocumentsModel = {
  //       [id]: documentModel,
  //     };

  //     expect(result).toEqual(validDto);
  //     expect(setSpy).not.toHaveBeenCalled();
  //     expect(updateSpy).toHaveBeenCalledWith(documentsModel);
  //   });
});
