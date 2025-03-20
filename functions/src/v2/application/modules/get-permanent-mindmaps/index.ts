import { Visibility } from '@domain/atoms/general';
import { type MindmapModel } from '@domain/models/mindmap';
import { controller } from '@utils/controller';
import { parse } from '@utils/parse';
import { type Id } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
});

type Dto = (MindmapModel & { id: Id; authorId: Id })[];

const getPermanentMindmapsController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const mindmapsSnap = await db
      .collectionGroup(`mindmaps`)
      .where(`visibility`, `==`, Visibility.Permanent)
      .orderBy(`cdate`, `desc`)
      .limit(payload.limit)
      .get();

    const mindmaps = mindmapsSnap.docs.map((doc) => ({
      ...(doc.data() as MindmapModel),
      id: doc.id,
      authorId: doc.ref.parent.parent!.id,
    }));

    return mindmaps;
  },
);

export { getPermanentMindmapsController };
