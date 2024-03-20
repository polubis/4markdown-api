import * as admin from 'firebase-admin';
import { Id } from '../entities/general';
import { ImageEntity, ImageEntityContent } from '../entities/image.entity';

export const ImagesRepository = (uid: Id) => {
  return {
    create: async ({
      id,
      ...content
    }: ImageEntityContent & { id: Id }): Promise<void> => {
      const collection = admin.firestore().collection(`images`);
      const document = collection.doc(uid);
      const images = await document.get();

      if (!images.exists) {
        await document.set(<ImageEntity>{
          [id]: content,
        });
        return;
      }

      const fields = images.data() as ImageEntity;

      await document.set(<ImageEntity>{
        ...fields,
        [id]: content,
      });
    },
  };
};
