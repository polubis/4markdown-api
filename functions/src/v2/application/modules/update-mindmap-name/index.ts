import {
  mindmapIdSchema,
  mindmapNameSchema,
  type MindmapModel,
} from '@domain/models/mindmap';
import { nowISO } from '@libs/helpers/stamps';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';
import { parse } from '@utils/parse';
import { date, Id } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  id: mindmapIdSchema,
  name: mindmapNameSchema,
  mdate: date,
});

type Dto = Pick<MindmapModel, `name` | `path` | `mdate`> & { id: Id };

const updateMindmapNameController = protectedController<Dto>(
  async (rawPayload, { db, uid }) => {
    const payload = await parse(payloadSchema, rawPayload);
    const userMindmapsRef = db.collection(`user-mindmaps`).doc(uid);
    const mindmapRef = userMindmapsRef.collection(`mindmaps`).doc(payload.id);

    const mindmapSnap = await mindmapRef.get();
    const mindmapData = mindmapSnap.data() as MindmapModel | undefined;

    if (!mindmapData) {
      throw errors.notFound(`Cannot find mindmap`);
    }

    if (mindmapData.mdate !== payload.mdate) {
      throw errors.outOfDate(`Mindmap has been already changed`);
    }

    const updatedMindmap: Pick<MindmapModel, `name` | `path` | `mdate`> = {
      name: payload.name.raw,
      path: payload.name.path,
      mdate: nowISO(),
    };

    await mindmapRef.update(updatedMindmap);

    return {
      ...updatedMindmap,
      id: payload.id,
    };
  },
);

export { updateMindmapNameController };
