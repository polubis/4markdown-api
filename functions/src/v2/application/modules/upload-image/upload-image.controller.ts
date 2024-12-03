import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type UploadImageDto,
  uploadImagePayloadSchema,
} from './upload-image.contract';

// uploadImage: async ({
//     payload,
//     context,
//   }: {
//     payload: UploadImagePayload;
//     context: Pick<CallableRequest<UploadImagePayload>, 'auth'>;
//   }): Promise<UploadImageDto> => {
//     const auth = AuthService.authorize(context);

//     const { extension, contentType, buffer } = Image.create(payload.image);
//     const storage = admin.storage();
//     const bucket = storage.bucket();
//     const [bucketExists] = await bucket.exists();

//     if (!bucketExists) {
//       throw errors.internal(`Cannot find bucket for images`);
//     }

//     const id = uuid();
//     const location = `${auth.uid}/images/${id}`;
//     const file = bucket.file(location);

//     await file.save(buffer, {
//       contentType,
//     });

//     const url = `https://firebasestorage.googleapis.com/v0/b/${
//       bucket.name
//     }/o/${encodeURIComponent(location)}?alt=media`;

//     await ImagesRepository(auth.uid).create({
//       id,
//       url,
//       contentType,
//       extension,
//     });

//     return {
//       extension,
//       contentType,
//       url,
//       id,
//     };
//   },

const uploadImageController = protectedController<UploadImageDto>(
  async (rawPayload, context) => {
    return await updateDocumentVisibilityHandler({
      context,
      payload: await parse(uploadImagePayloadSchema, rawPayload),
    });
  },
);

export { uploadImageController };
