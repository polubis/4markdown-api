import {
  THUMBNAIL_EXTENSIONS,
  ThumbnailExtension,
} from '../entities/doc.entity';
import { Blob } from '../entities/general';

const thumbnailValidators = {
  format: (image: unknown): image is Blob => typeof image === `string`,
  extension: (extension: string): extension is ThumbnailExtension =>
    THUMBNAIL_EXTENSIONS.includes(extension as ThumbnailExtension),
  size: (buffer: Buffer): boolean => {
    const sizeAsMegabytes = Number.parseFloat(
      (Buffer.byteLength(buffer) / 1024 / 1024).toFixed(2),
    );

    return sizeAsMegabytes < thumbnailValidators.limitInMegabytes;
  },
  limitInMegabytes: 1,
};

export { thumbnailValidators };
