import { z } from 'zod';
import { errors } from '../core/errors';

const EXTENSIONS = [`jpg`, `jpeg`, `gif`, `png`, `webp`] as const;
const CONTENT_TYPES = [
  `image/jpg`,
  `image/jpeg`,
  `image/gif`,
  `image/png`,
  `image/webp`,
] as const;

const schema = z.object({
  contentType: z.enum(CONTENT_TYPES),
  extension: z.enum(EXTENSIONS),
  data: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number(),
});

type IImageEntity = z.infer<typeof schema>;

const decode = (base64: string): IImageEntity => {
  const [meta] = base64.split(`,`);
  const contentType = meta.split(`:`)[1].split(`;`)[0];
  const extension = contentType.replace(`image/`, ``);
  const data = base64.replace(/^data:image\/\w+;base64,/, ``);
  const buffer = Buffer.from(data, `base64`);
  // Size in MegaBytes
  const size = Number.parseFloat(
    (Buffer.byteLength(buffer) / 1024 / 1024).toFixed(2),
  );

  return schema.parse({ data, extension, contentType, buffer, size });
};

const ImageEntity = (image: unknown) => {
  try {
    const base64 = z.string().parse(image);
    return decode(base64);
  } catch (err) {
    throw errors.invalidSchema(`ImageEntity`);
  }
};

export { ImageEntity };
