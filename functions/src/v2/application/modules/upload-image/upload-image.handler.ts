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
  ImageModel,
  ImagesModel,
} from '@domain/models/image';
import { errors } from '@utils/errors';
import { toUnit } from '@libs/helpers/to-unit';
import { storage } from 'firebase-admin';
import { uuid } from '@libs/helpers/stamps';
import { webp } from '@libs/helpers/webp';

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

// @TODO[PRIO=2]: [Add bucket + storage to injected API's??? Or abstract it?].
const createUrl = ({
  location,
  name,
}: {
  name: string;
  location: string;
}): string => {
  return `https://firebasestorage.googleapis.com/v0/b/${name}/o/${encodeURIComponent(
    location,
  )}?alt=media`;
};

const uploadImageHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: UploadImagePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UploadImageDto> => {
  const { contentType, extension, size, buffer } = decodeImage(payload.image);

  if (
    !isSupportedExtension(extension) ||
    !isSupportedContentType(contentType)
  ) {
    throw errors.badRequest(
      `The provided image extension is not supported. Supported extensions are: ${IMAGE_EXTENSIONS.join(
        `, `,
      )}`,
    );
  }

  const SIZE_IN_MB_LIMIT = 4;

  if (toUnit(size, `mb`) > SIZE_IN_MB_LIMIT) {
    throw errors.badRequest(
      `Max image size is ${SIZE_IN_MB_LIMIT} megabytes (MB)`,
    );
  }

  const userImagesRef = db.collection(`images`).doc(uid);

  const [userImagesSnap, resizedBuffer] = await Promise.all([
    userImagesRef.get(),
    extension === `gif`
      ? Promise.resolve(buffer)
      : webp({ buffer, quality: 50 }),
  ]);

  const id = uuid();
  const location = `${uid}/images/${id}`;
  const bucket = storage().bucket();
  const file = bucket.file(location);
  const url = createUrl({ name: bucket.name, location });

  const imageModel: ImageModel = {
    extension: extension === `gif` ? `gif` : `webp`,
    contentType: contentType === `image/gif` ? `image/gif` : `image/webp`,
    url,
  };

  const imagesModel: ImagesModel = {
    [id]: imageModel,
  };

  const userImages = userImagesSnap.data();

  const oneYearCache = `public, max-age=31536000`;

  await Promise.all([
    file.save(resizedBuffer, {
      contentType: imageModel.contentType,
      metadata: {
        cacheControl: oneYearCache,
      },
    }),
    userImages
      ? userImagesRef.update(imagesModel)
      : userImagesRef.set(imagesModel),
  ]);

  return {
    id,
    ...imageModel,
  };
};

export { uploadImageHandler };
