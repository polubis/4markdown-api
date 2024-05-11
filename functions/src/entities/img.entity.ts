import { z } from 'zod';
import { errors } from '../core/errors';

const decode = (
  base64: string,
): {
  contentType: string;
  extension: string;
  data: string;
  buffer: Buffer;
  size: number;
} => {
  const [meta] = base64.split(`,`);
  const contentType = meta.split(`:`)[1].split(`;`)[0];
  const extension = contentType.replace(`image/`, ``);
  const data = base64.replace(/^data:image\/\w+;base64,/, ``);
  const buffer = Buffer.from(data, `base64`);
  // Size in MegaBytes
  const size = Number.parseFloat(
    (Buffer.byteLength(buffer) / 1024 / 1024).toFixed(2),
  );

  return {
    data,
    extension,
    contentType,
    buffer,
    size,
  };
};

const EXTENSIONS = [`jpg`, `jpeg`, `gif`, `png`, `webp`] as const;
const CONTENT_TYPES = [
  `image/jpg`,
  `image/jpeg`,
  `image/gif`,
  `image/png`,
  `image/webp`,
] as const;

const ImageEntity = (image: unknown) => {
  try {
    const base64 = z.string().base64().parse(image);
    const decodedImage = decode(base64);

    const parsedImage = z
      .object({
        contentType: z.enum(CONTENT_TYPES),
        extension: z.enum(EXTENSIONS),
        data: z.string(),
        buffer: z.number(),
        size: z.number(),
      })
      .parse(decodedImage);

    return parsedImage;
  } catch (err) {
    throw errors.invalidSchema(`ImageEntity`);
  }
};

export { ImageEntity };
