import { type MindmapModel } from '@domain/models/mindmap';
import { controller } from '@utils/controller';
import { parse } from '@utils/parse';
import { id, type Id } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  limit: z.number().min(10).max(100),
  lastMindmapId: id.optional(),
});

type Dto = (MindmapModel & { id: Id })[];

const getPermanentMindmapsController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const mindmapsQuery = db
      .collectionGroup(`mindmaps`)
      .where(`isPermanent`, `==`, true)
      .orderBy(`cdate`, `desc`)
      .limit(payload.limit);

    const mindmapsSnap = await mindmapsQuery.get();

    return mindmapsSnap.docs.map((doc) => ({
      ...(doc.data() as MindmapModel),
      id: doc.id,
    }));
  },
);

export { getPermanentMindmapsController };
