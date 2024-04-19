import {
  IMAGE_EXTENSIONS,
  ImageContentType,
  ImageExtension,
} from '../entities/image.entity';
import { parseImage } from '../utils/parse-image';
import { imageValidators } from '../validation/image';
import { errors } from './errors';

const Image = () => {};

Image.create = (
  image: unknown,
): {
  extension: ImageExtension;
  contentType: ImageContentType;
  buffer: Buffer;
} => {
  if (!imageValidators.format(image)) {
    throw errors.invalidArg(`Wrong image data type`);
  }

  const { buffer, contentType, extension } = parseImage(image);

  if (!imageValidators.extension(extension)) {
    throw errors.invalidArg(
      `Unsupported image format, use supported one: ${IMAGE_EXTENSIONS.join(
        `, `,
      )}`,
    );
  }

  if (!imageValidators.size(buffer)) {
    throw errors.invalidArg(
      `Max image size is ${imageValidators.limitInMegabytes} (MB)`,
    );
  }

  return {
    extension,
    contentType: contentType as ImageContentType,
    buffer,
  };
};

export { Image };
