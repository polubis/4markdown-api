import { type MindmapModel } from '@domain/models/mindmap';
import { nowISO } from '@libs/helpers/stamps';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';
import { parse } from '@utils/parse';
import { date, id, name, type Id } from '@utils/validators';
import { z } from 'zod';

const schema = z.object({
  id,
  mdate: date,
  name: name(),
});

type Dto = MindmapModel & { id: Id };

export const updateMindmapNameController = protectedController<Dto>(
  async (rawPayload, context) => {
    const payload = await parse(schema, rawPayload);

    return context.db.runTransaction(async (t) => {
      const userMindmapRef = context.db
        .collection(`user-mindmaps`)
        .doc(context.uid)
        .collection(`mindmaps`)
        .doc(payload.id);

      const userMindmapSnap = await t.get(userMindmapRef);

      const userMindmap = userMindmapSnap.data() as MindmapModel | undefined;

      if (!userMindmap) {
        throw errors.notFound(`Cannot find mindmap to update`);
      }

      if (userMindmap.mdate !== payload.mdate) {
        throw errors.outOfDate(
          `Cannot update mindmap structure because it's already changed`,
        );
      }

      const mindmapPartToUpdate: Pick<MindmapModel, 'mdate' | 'name' | 'path'> =
        {
          mdate: nowISO(),
          name: payload.name.raw,
          path: payload.name.path,
        };

      await t.update(userMindmapRef, mindmapPartToUpdate);

      return {
        ...userMindmap,
        ...mindmapPartToUpdate,
        id: payload.id,
      };
    });
  },
);
