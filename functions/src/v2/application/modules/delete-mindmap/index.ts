import { protectedController } from '@utils/controller';
import { id } from '@utils/validators';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const payloadSchema = z
  .object({
    id,
  })
  .strict();

const deleteMindmapController = protectedController<null>(
  async (rawPayload, { uid, db }) => {
    const payload = await payloadSchema.parseAsync(rawPayload);
    const yourMindmapsRef = db.collection(`user-mindmaps`).doc(uid);
    const yourMindmapRef = yourMindmapsRef
      .collection(`mindmaps`)
      .doc(payload.id);

    await db.runTransaction(async (t) => {
      t.delete(yourMindmapRef);
      t.update(yourMindmapsRef, {
        mindmapsCount: FieldValue.increment(-1),
      });
    });

    return null;
  },
);

export { deleteMindmapController };
