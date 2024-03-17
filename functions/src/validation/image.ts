import { Blob } from '../entities/general';
import { IMAGE_EXTENSIONS, ImageExtension } from '../entities/image.entity';

const imageValidators = {
  format: (image: unknown): image is Blob => typeof image === `string`,
  extension: (extension: string): extension is ImageExtension =>
    IMAGE_EXTENSIONS.includes(extension as ImageExtension),
};

export { imageValidators };
