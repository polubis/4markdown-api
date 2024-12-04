import { uploadImageHandler } from '../upload-image.handler';

describe(`Image upload works when`, () => {
  const uid = `user-uid`;
  const projectId = `project-id`;

  it(`an error is thrown when the content type is invalid, the extension is unsupported, or the image size exceeds the limit`, async () => {
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
