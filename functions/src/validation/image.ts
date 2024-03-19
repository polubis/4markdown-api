import { Blob } from '../entities/general';
import { IMAGE_EXTENSIONS, ImageExtension } from '../entities/image.entity';

const imageValidators = {
  format: (image: unknown): image is Blob => typeof image === `string`,
  extension: (extension: string): extension is ImageExtension =>
    IMAGE_EXTENSIONS.includes(extension as ImageExtension),
  size: (buffer: Buffer): boolean => {
    const sizeAsMegabytes = Number.parseFloat(
      (Buffer.byteLength(buffer) / 1024 / 1024).toFixed(2),
    );

    return sizeAsMegabytes < imageValidators.limitInMegabytes;
  },
  limitInMegabytes: 4,
};

export { imageValidators };
