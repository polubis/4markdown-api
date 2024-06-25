import { z } from 'zod';
import { protectedController } from '../../../libs/framework/controller';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import {
  getDefaultBucket,
  createDefaultBucketDownloadURL,
  DefaultBucket,
  defaultBucketFolders,
} from '../../storage/buckets';
import { uuid } from '../../../libs/helpers/stamps';
import { ImagesModel } from '../../../domain/models/image';

const payloadSchema = z.object({
  image: validators.image,
});

type Payload = z.infer<typeof payloadSchema>;

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

const uploadImageToBucket = async ({
  payload: {
    image: { buffer, contentType },
  },
  bucket,
  location,
}: {
  payload: Payload;
  bucket: DefaultBucket;
  location: string;
}) => {
  const file = bucket.file(location);
  await file.save(buffer, { contentType });
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
    const { contentType, extension } = payload.image;

    await Promise.all([
      uploadImageToBucket({ payload, location, bucket }),
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
