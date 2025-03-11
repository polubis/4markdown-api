import {
  mindmapDescriptionSchema,
  mindmapIdSchema,
  MindmapModel,
  mindmapNameSchema,
  mindmapTagsSchema,
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
  name: mindmapNameSchema,
  description: mindmapDescriptionSchema,
  tags: mindmapTagsSchema,
});

type Dto = Pick<
  MindmapModel,
  'mdate' | 'name' | 'description' | 'tags' | 'path'
>;

const updateMindmapController = protectedController<Dto>(
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

    const updatedMindmap: Dto = {
      name: payload.name.raw,
      path: payload.name.path,
      description: payload.description,
      tags: payload.tags,
      mdate: nowISO(),
    };

    await yourMindmapRef.update(updatedMindmap);

    return updatedMindmap;
  },
);

export { updateMindmapController };
