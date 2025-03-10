import { MindmapModel } from '@domain/models/mindmap';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';
import { parse } from '@utils/parse';
import { date, id } from '@utils/validators';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const payloadSchema = z.object({
  id,
  mdate: date,
});

const deleteMindmapController = protectedController<null>(
  async (rawPayload, { uid, db }) => {
    const payload = await parse(payloadSchema, rawPayload);
    const yourMindmapsRef = db.collection(`user-mindmaps`).doc(uid);
    const yourMindmapRef = yourMindmapsRef
      .collection(`mindmaps`)
      .doc(payload.id);

    return db.runTransaction(async (t) => {
      const yourMindmapData = (await t.get(yourMindmapRef)).data() as
        | MindmapModel
        | undefined;

      if (!yourMindmapData) {
        throw errors.notFound(`Cannot find mindmap`);
      }

      if (yourMindmapData.mdate !== payload.mdate) {
        throw errors.outOfDate(`Cannot remove already changed mindmap`);
      }

      t.delete(yourMindmapRef);
      t.update(yourMindmapsRef, {
        mindmapsCount: FieldValue.increment(-1),
      });

      return null;
    });
  },
);

export { deleteMindmapController };
