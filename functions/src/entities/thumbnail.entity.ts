import { z } from 'zod';
import { errors } from '../core/errors';
import * as sharp from 'sharp';

const EXTENSIONS = [`jpg`, `jpeg`, `png`, `webp`] as const;
const CONTENT_TYPES = [
  `image/jpg`,
  `image/jpeg`,
  `image/png`,
  `image/webp`,
] as const;

const schema = z.object({
  contentType: z.enum(CONTENT_TYPES),
  extension: z.enum(EXTENSIONS),
  data: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().max(2),
  height: z.number().min(320),
  width: z.number().min(864),
});

type IThumbnailEntity = z.infer<typeof schema>;

const decode = async (base64: string): Promise<IThumbnailEntity> => {
  const [meta] = base64.split(`,`);
  const contentType = meta.split(`:`)[1].split(`;`)[0];
  const extension = contentType.replace(`image/`, ``);
  const data = base64.replace(/^data:image\/\w+;base64,/, ``);
  const buffer = Buffer.from(data, `base64`);
  // Size in MegaBytes
  const size = Number.parseFloat(
    (Buffer.byteLength(buffer) / 1024 / 1024).toFixed(2),
  );
  const { height, width } = await sharp(buffer).metadata();

  return schema.parse({
    data,
    extension,
    contentType,
    buffer,
    size,
    height,
    width,
  });
};

const ThumbnailEntity = async (
  thumbnail: unknown,
): Promise<IThumbnailEntity> => {
  try {
    const base64 = z.string().parse(thumbnail);
    return await decode(base64);
  } catch (err) {
    throw errors.invalidSchema(`ThumbnailEntity`);
  }
};

export { ThumbnailEntity };
