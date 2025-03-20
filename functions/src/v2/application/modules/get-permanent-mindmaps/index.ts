import { Visibility } from '@domain/atoms/general';
import { type MindmapModel } from '@domain/models/mindmap';
import { controller } from '@utils/controller';
import { parse } from '@utils/parse';
import { type Id } from '@utils/validators';
import { logger } from 'firebase-functions/v2';
import { z } from 'zod';

const payloadSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
});

type Dto = (MindmapModel & { id: Id; authorId: Id })[];

const getPermanentMindmapsController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);
    logger.info(`Getting permanent mindmaps with limit ${payload.limit}`);

    try {
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

      logger.info(`Found ${mindmaps.length} permanent mindmaps`);

      return mindmaps;
    } catch (error: any) {
      logger.error(error.message);
      throw new Error(error);
    }
  },
);

export { getPermanentMindmapsController };
