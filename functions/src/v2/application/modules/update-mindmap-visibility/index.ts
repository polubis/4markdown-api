import { Visibility } from '@domain/atoms/general';
import { MindmapModel } from '@domain/models/mindmap';
import { nowISO } from '@libs/helpers/stamps';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';
import {
  mindmapIdSchema,
  mindmapVisibilitySchema,
} from '@utils/mindmap-schemas';
import { parse } from '@utils/parse';
import { date } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  id: mindmapIdSchema,
  mdate: date,
  visibility: mindmapVisibilitySchema,
});

type Dto = Pick<MindmapModel, 'mdate'>;

const updateMindmapVisibilityController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const yourMindmapsRef = db.collection(`user-mindmaps`).doc(uid);
    const yourMindmapRef = yourMindmapsRef
      .collection(`mindmaps`)
      .doc(payload.id);
    const permanentMindmapsRef = db.collection(`permanent-mindmaps`);

    return await db.runTransaction(async (t) => {
      const yourMindmapData = (await t.get(yourMindmapRef)).data() as
        | MindmapModel
        | undefined;

      if (!yourMindmapData) {
        throw errors.notFound(`Cannot find mindmap`);
      }

      if (yourMindmapData.mdate !== payload.mdate) {
        throw errors.outOfDate(
          `Cannot update already changed mindmap. Refresh and try again`,
        );
      }

      const updateMindmap: Pick<MindmapModel, 'mdate' | 'visibility'> = {
        visibility: payload.visibility,
        mdate: nowISO(),
      };

      if (payload.visibility === Visibility.Permanent) {
        t.set(
          permanentMindmapsRef.doc(payload.id),
          {
            mindmapId: payload.id,
          },
          { merge: true },
        );
      } else {
        t.delete(permanentMindmapsRef.doc(payload.id));
      }

      t.update(yourMindmapRef, updateMindmap);

      return {
        mdate: updateMindmap.mdate,
      };
    });
  },
);

export { updateMindmapVisibilityController };
