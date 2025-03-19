import { type MindmapModel } from '@domain/models/mindmap';
import { PermanentMindmapModel } from '@domain/models/permanent-mindmaps';
import { controller } from '@utils/controller';
import { mindmapIdSchema } from '@utils/mindmap-schemas';
import { parse } from '@utils/parse';
import { type Id } from '@utils/validators';
import { logger } from 'firebase-functions/v2';
import { z } from 'zod';

const payloadSchema = z.object({
  limit: z.number().min(10).max(100).optional(),
  lastMindmapId: mindmapIdSchema.optional(),
});

type Dto = (MindmapModel & { id: Id })[];

const getPermanentMindmapsController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);
    const limit = payload.limit ?? 10;
    // const lastMindmapId = payload.lastMindmapId;

    const permanentMindmapsSnap = await db
      .collection(`permanent-mindmaps`)
      .orderBy(`cdate`, `desc`)
      .limit(limit)
      .get();

    const permanentMindmapsData = permanentMindmapsSnap.docs.reduce<
      Record<Id, PermanentMindmapModel>
    >((acc, permanentMindmapSnap) => {
      acc[permanentMindmapSnap.id] =
        permanentMindmapSnap.data() as PermanentMindmapModel;

      return acc;
    }, {});

    logger.info(permanentMindmapsData);

    const mindmapsSnap = await db
      .collectionGroup(`mindmaps`)
      .where(`id`, `in`, Object.keys(permanentMindmapsData))
      .get();

    const mindmaps = mindmapsSnap.docs.map((doc) => ({
      ...(doc.data() as MindmapModel),
      id: doc.id,
    }));

    return mindmaps;
  },
);

export { getPermanentMindmapsController };
