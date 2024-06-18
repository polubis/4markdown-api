import { getBucket } from '../core/bucket';
import { DocThumbnail } from '../entities/doc.entity';
import { Blob, Id } from '../entities/general';
import { ThumbnailEntity } from '../entities/thumbnail.entity';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';

const sizes = [
  {
    key: `xl`,
    w: 864,
    h: 320,
    q: 70,
  },
  {
    key: `lg`,
    w: 690,
    h: 240,
    q: 70,
  },
  {
    key: `md`,
    w: 460,
    h: 160,
    q: 70,
  },
  {
    key: `sm`,
    w: 230,
    h: 80,
    q: 70,
  },
  {
    key: `tn`,
    w: 92,
    h: 32,
    q: 70,
  },
] as const;

const createThumbnailPath = (uid: Id, key: string): string =>
  `${uid}/thumbnails/${key}`;

const ThumbnailsService = {
  upload: async (uid: Id, data: Blob): Promise<DocThumbnail> => {
    const { buffer } = ThumbnailEntity(data);
    const bucket = await getBucket();

    const rescalePromises: Promise<Buffer>[] = [];

    sizes.forEach(({ h, w, q }) => {
      rescalePromises.push(
        sharp(buffer).resize(w, h).webp({ quality: q }).toBuffer(),
      );
    });

    const rescaleBuffers = await Promise.all(rescalePromises);
    const savePromises: Promise<void>[] = [];
    const paths: string[] = [];
    const ext = `webp`;

    sizes.forEach(({ key }, idx) => {
      const path = createThumbnailPath(uid, key);
      const file = bucket.file(path);
      const buffer = rescaleBuffers[idx];

      savePromises.push(
        file.save(buffer, {
          contentType: ext,
        }),
      );
      paths.push(path);
    });

    const [placeholderBuffer] = await Promise.all([
      sharp(buffer).resize(12, 12).webp({ quality: 1 }).toBuffer(),
      ...savePromises,
    ]);

    const thumbnail = sizes.reduce<NonNullable<DocThumbnail>>(
      (acc, { key, w, h }, idx) => ({
        ...acc,
        [key]: {
          h,
          w,
          ext,
          src: `https://firebasestorage.googleapis.com/v0/b/${
            bucket.name
          }/o/${encodeURIComponent(paths[idx])}?alt=media`,
          id: uuid(),
        },
      }),
      {
        placeholder: `data:image/jpeg;base64,${placeholderBuffer.toString(
          `base64`,
        )}`,
      } as NonNullable<DocThumbnail>,
    );

    return thumbnail;
  },
  delete: async (uid: Id) => {
    const bucket = await getBucket();
    const deletePromises = sizes.map(({ key }) =>
      bucket.file(createThumbnailPath(uid, key)).delete(),
    );

    await Promise.all(deletePromises);
  },
};

export { ThumbnailsService };
