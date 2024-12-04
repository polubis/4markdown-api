import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type UploadImagePayload,
  type UploadImageDto,
} from './upload-image.contract';
import { decodeBase64Asset } from '@utils/decode-base64-asset';
import {
  IMAGE_CONTENT_TYPES,
  IMAGE_EXTENSIONS,
  ImageContentType,
  ImageExtension,
} from '@domain/models/image';
import { errors } from '@utils/errors';
import { toUnit } from '@libs/helpers/to-unit';

// uploadImage: async ({
//     payload,
//     context,
//   }: {
//     payload: UploadImagePayload;
//     context: Pick<CallableRequest<UploadImagePayload>, 'auth'>;
//   }): Promise<UploadImageDto> => {
//     const auth = AuthService.authorize(context);

//     const { extension, contentType, buffer } = Image.create(payload.image);
//     const storage = admin.storage();
//     const bucket = storage.bucket();
//     const [bucketExists] = await bucket.exists();

//     if (!bucketExists) {
//       throw errors.internal(`Cannot find bucket for images`);
//     }

//     const id = uuid();
//     const location = `${auth.uid}/images/${id}`;
//     const file = bucket.file(location);

//     await file.save(buffer, {
//       contentType,
//     });

//     const url = `https://firebasestorage.googleapis.com/v0/b/${
//       bucket.name
//     }/o/${encodeURIComponent(location)}?alt=media`;

//     await ImagesRepository(auth.uid).create({
//       id,
//       url,
//       contentType,
//       extension,
//     });

//     return {
//       extension,
//       contentType,
//       url,
//       id,
//     };
//   },

const SIZE_IN_MB_LIMIT = 4;

const isSupportedContentType = (
  contentType: string,
): contentType is ImageContentType =>
  IMAGE_CONTENT_TYPES.includes(contentType as ImageContentType);

const isSupportedExtension = (extension: string): extension is ImageExtension =>
  IMAGE_EXTENSIONS.includes(extension as ImageExtension);

const decodeImage = (
  image: UploadImagePayload['image'],
): ReturnType<typeof decodeBase64Asset> => {
  try {
    return decodeBase64Asset(image);
  } catch {
    throw errors.badRequest(`Cannot decode. Invalid image format`);
  }
};

const uploadImageHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: UploadImagePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UploadImageDto> => {
  const { contentType, extension, blob, size, buffer } = decodeImage(
    payload.image,
  );

  if (!isSupportedContentType(contentType)) {
    throw errors.badRequest(
      `The provided image content type is not supported. Supported content types are: ${IMAGE_CONTENT_TYPES.join(
        `, `,
      )}`,
    );
  }

  if (!isSupportedExtension(extension)) {
    throw errors.badRequest(
      `The provided image extension is not supported. Supported extensions are: ${IMAGE_EXTENSIONS.join(
        `, `,
      )}`,
    );
  }

  if (toUnit(size, `MB`) > SIZE_IN_MB_LIMIT) {
    throw errors.badRequest(
      `The provided image extension is not supported. Supported extensions are: ${IMAGE_EXTENSIONS.join(
        `, `,
      )}`,
    );
  }

  return {
    contentType,
    extension,
    id: ``,
    url: ``,
  };
};

export { uploadImageHandler };
