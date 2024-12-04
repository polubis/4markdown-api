import { webp } from '@libs/helpers/webp';
import { uploadImageHandler } from '../upload-image.handler';
import { storage } from 'firebase-admin';
import { ImageModel } from '@domain/models/image';

const uuidMock = `2024-12-01T00:00:00Z`;

jest.mock(`firebase-admin`, () => ({
  storage: jest.fn(),
}));
jest.mock(`@libs/helpers/webp`, () => ({
  webp: jest.fn(),
}));
jest.mock(`@libs/helpers/stamps`, () => ({
  uuid: () => uuidMock,
}));

const mockedStorage = jest.mocked(storage);
const mockedWebp = jest.mocked(webp);

describe(`Image upload works when`, () => {
  const uid = `user-uid`;
  const projectId = `project-id`;
  const bucketName = `bucket`;

  it(`uploads image and creates metadata entry if there is no images yet`, async () => {
    const setSpy = jest.fn();

    mockedStorage.mockImplementation(
      () =>
        ({
          bucket: () => ({
            name: bucketName,
            file: () => ({
              save: jest.fn(),
            }),
          }),
        }) as any,
    );

    const response = await uploadImageHandler({
      payload: {
        image: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE`,
      },
      context: {
        uid,
        db: {
          collection: () => ({
            doc: () => ({
              get: async () => ({
                data: () => null,
              }),
              set: setSpy,
            }),
          }),
        } as any,
        projectId,
      },
    });

    const imageModel: ImageModel = {
      contentType: `image/jpeg`,
      extension: `jpeg`,
      url: `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/user-uid%2Fimages%2F2024-12-01T00%3A00%3A00Z?alt=media`,
    };

    expect(mockedWebp).toHaveBeenCalledTimes(1);
    expect(mockedWebp).toHaveBeenCalledWith(
      expect.objectContaining({
        buffer: expect.any(Buffer),
        quality: 50,
      }),
    );
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledWith({
      [uuidMock]: imageModel,
    });
    expect(response).toEqual({
      id: uuidMock,
      ...imageModel,
    });
  });

  it(`an error is thrown when the content type is invalid or the extension is unsupported`, async () => {
    try {
      await uploadImageHandler({
        payload: {
          image: `totally-invalid-image-format`,
        },
        context: {
          uid,
          db: {} as any,
          projectId,
        },
      });
    } catch (error: unknown) {
      expect(error).toEqual(
        Error(
          JSON.stringify({
            symbol: `bad-request`,
            content: `Cannot decode. Invalid image format`,
            message: `Cannot decode. Invalid image format`,
          }),
        ),
      );
    }

    try {
      await uploadImageHandler({
        payload: {
          image: `data:application/unknown;base64,abcdef123456`,
        },
        context: {
          uid,
          db: {} as any,
          projectId,
        },
      });
    } catch (error: unknown) {
      expect(error).toEqual(
        Error(
          JSON.stringify({
            symbol: `bad-request`,
            content: `The provided image extension is not supported. Supported extensions are: jpg, jpeg, png, webp, gif`,
            message: `The provided image extension is not supported. Supported extensions are: jpg, jpeg, png, webp, gif`,
          }),
        ),
      );
    }
  });
});
