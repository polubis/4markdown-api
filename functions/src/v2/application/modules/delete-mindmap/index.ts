import { mindmapIdSchema } from '@domain/models/mindmap';
import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const payloadSchema = z.object({
  id: mindmapIdSchema,
});

type Dto = null;

const deleteMindmapController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const payload = await parse(payloadSchema, rawPayload);
    const yourMindmapsRef = db.collection(`user-mindmaps`).doc(uid);
    const yourMindmapRef = yourMindmapsRef
      .collection(`mindmaps`)
      .doc(payload.id);

    return db.runTransaction(async (t) => {
      t.delete(yourMindmapRef);
      t.update(yourMindmapsRef, {
        mindmapsCount: FieldValue.increment(-1),
      });

      return null;
    });
  },
);

export { deleteMindmapController };
