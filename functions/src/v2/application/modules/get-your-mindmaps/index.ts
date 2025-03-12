import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import { z } from 'zod';
import {
  MindmapMetaModel,
  MindmapModel,
  MindmapModelId,
} from '@domain/models/mindmap';

const payloadSchema = z.null();

type Dto = {
  mindmaps: (MindmapModel & { id: MindmapModelId })[];
} & MindmapMetaModel;

const getYourMindmapsController = protectedController<Dto>(
  async (rawPayload, { db, uid }) => {
    await parse(payloadSchema, rawPayload);

    const yourMindmapsRef = db.collection(`user-mindmaps`).doc(uid);

    const [yourMindmapsMetaSnap, yourMindmapsSnap] = await Promise.all([
      yourMindmapsRef.get(),
      yourMindmapsRef.collection(`mindmaps`).get(),
    ]);

    const yourMindmapsMeta = yourMindmapsMetaSnap.data() as
      | { mindmapsCount: number }
      | undefined;

    if (!yourMindmapsMeta || yourMindmapsMeta.mindmapsCount === 0) {
      return {
        mindmaps: [],
        mindmapsCount: 0,
      };
    }

    const yourMindmaps = yourMindmapsSnap.docs.map((mindmap) => ({
      ...(mindmap.data() as MindmapModel),
      id: mindmap.id,
    }));

    return {
      mindmaps: yourMindmaps,
      mindmapsCount: yourMindmaps.length,
    };
  },
);

export { getYourMindmapsController };
