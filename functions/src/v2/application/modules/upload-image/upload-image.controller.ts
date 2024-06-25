import { z } from 'zod';
import { protectedController } from '../../../libs/framework/controller';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import {
  getDefaultBucket,
  createDefaultBucketDownloadURL,
  defaultBucketFolders,
} from '../../storage/buckets';
import { uuid } from '../../../libs/helpers/stamps';
import {
  ImagesModel,
  imageModelContentTypes,
  imageModelExtensions,
} from '../../../domain/models/image';
import { regexes } from '../../utils/regexes';

const payloadSchema = z.object({
  image: z
    .string()
    // @TODO: Parase and Valdiate it separately.
    .regex(regexes.base64)
    .transform(async (value) => {
      const [meta] = value.split(`,`);
      const contentType = meta.split(`:`)[1].split(`;`)[0];
      const extension = contentType.replace(`image/`, ``);
      const blob = value.replace(/^data:image\/\w+;base64,/, ``);
      const buffer = Buffer.from(blob, `base64`);
      // Size in Megabytes.
      const size = Number.parseFloat(
        (Buffer.byteLength(buffer) / 1024 / 1024).toFixed(2),
      );

      const schema = z.object({
        blob: z.string().min(1),
        contentType: z.enum(imageModelContentTypes),
        extension: z.enum(imageModelExtensions),
        buffer: z.instanceof(Buffer),
        size: z.number().min(0).max(4),
      });

      const image = {
        blob,
        contentType,
        extension,
        buffer,
        size,
      };

      return await parse(schema, image);
    }),
});

const generateMetadata = ({
  uid,
  bucketName,
}: {
  uid: string;
  bucketName: string;
}) => {
  const id = uuid();
  const location = `${uid}/${defaultBucketFolders.images}/${id}`;

  const url = createDefaultBucketDownloadURL({
    name: bucketName,
    location,
  });

  return { id, location, url };
};

const saveImageMetadata = async ({
  uid,
  model,
}: {
  uid: string;
  model: ImagesModel;
}) => {
  const document = collections.images().doc(uid);
  const images = await document.get();

  const updatedImages: ImagesModel = images.exists
    ? {
        ...((images.data() as ImagesModel | undefined) ?? {}),
        ...model,
      }
    : model;

  await document.set(updatedImages);
};

const uploadImageController = protectedController(
  async (rawPayload, { uid }) => {
    const [payload, bucket] = await Promise.all([
      parse(payloadSchema, rawPayload),
      getDefaultBucket(),
    ]);

    const { id, location, url } = generateMetadata({
      uid,
      bucketName: bucket.name,
    });
    const { contentType, extension, buffer } = payload.image;
    const file = bucket.file(location);

    await Promise.all([
      file.save(buffer, { contentType }),
      saveImageMetadata({
        uid,
        model: {
          [id]: {
            url,
            contentType,
            extension,
          },
        },
      }),
    ]);

    return {
      extension,
      contentType,
      url,
      id,
    };
  },
);

export { uploadImageController };
