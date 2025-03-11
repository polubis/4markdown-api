import {
  mindmapIdSchema,
  MindmapModel,
  mindmapVisibilitySchema,
} from '@domain/models/mindmap';
import { nowISO } from '@libs/helpers/stamps';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';
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

    const yourMindmapData = (await yourMindmapRef.get()).data() as
      | MindmapModel
      | undefined;

    if (!yourMindmapData) {
      throw errors.notFound(`Cannot find mindmap`);
    }

    if (yourMindmapData.mdate !== payload.mdate) {
      throw errors.outOfDate(`Cannot remove already changed mindmap`);
    }

    const updateMindmap: Pick<MindmapModel, 'mdate' | 'visibility'> = {
      visibility: payload.visibility,
      mdate: nowISO(),
    };

    await yourMindmapRef.update(updateMindmap);

    return {
      mdate: updateMindmap.mdate,
    };
  },
);

export { updateMindmapVisibilityController };
