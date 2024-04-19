import {
  THUMBNAIL_EXTENSIONS,
  ThumbnailContentType,
  ThumbnailExtension,
} from '../entities/doc.entity';
import { parseImage } from '../utils/parse-image';
import { thumbnailValidators } from '../validation/thumbnail';
import { errors } from './errors';

const Thumbnail = () => {};

Thumbnail.create = (
  thumbnail: unknown,
): {
  extension: ThumbnailExtension;
  contentType: ThumbnailContentType;
  buffer: Buffer;
} => {
  if (!thumbnailValidators.format(thumbnail)) {
    throw errors.invalidArg(`Wrong thumbnail data type`);
  }

  const { buffer, contentType, extension } = parseImage(thumbnail);

  if (!thumbnailValidators.extension(extension)) {
    throw errors.invalidArg(
      `Unsupported thumbnail format, use supported one: ${THUMBNAIL_EXTENSIONS.join(
        `, `,
      )}`,
    );
  }

  if (!thumbnailValidators.size(buffer)) {
    throw errors.invalidArg(
      `Max image size is ${thumbnailValidators.limitInMegabytes} (MB)`,
    );
  }

  return {
    extension,
    contentType: contentType as ThumbnailContentType,
    buffer,
  };
};

export { Thumbnail };
