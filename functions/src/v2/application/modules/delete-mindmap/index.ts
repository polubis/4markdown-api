import { MindmapModel } from '@domain/models/mindmap';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';
import { parse } from '@utils/parse';
import { date, id } from '@utils/validators';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/https';
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

    const result = await db.runTransaction<
      { is: `fail`; error: HttpsError } | { is: `ok` }
    >(async (t) => {
      const yourMindmapData = (await t.get(yourMindmapRef)).data() as
        | MindmapModel
        | undefined;

      if (!yourMindmapData) {
        return { is: `fail`, error: errors.notFound(`Cannot find mindmap`) };
      }

      if (yourMindmapData.mdate !== payload.mdate) {
        return {
          is: `fail`,
          error: errors.outOfDate(`Cannot remove already changed mindmap`),
        };
      }

      t.delete(yourMindmapRef);
      t.update(yourMindmapsRef, {
        mindmapsCount: FieldValue.increment(-1),
      });

      return { is: `ok` };
    });

    if (result.is === `fail`) {
      throw result.error;
    }

    return null;
  },
);

export { deleteMindmapController };
