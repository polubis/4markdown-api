import { Visibility } from '@domain/atoms/general';
import { type MindmapModel } from '@domain/models/mindmap';
import { controller } from '@utils/controller';
import { parse } from '@utils/parse';
import { id, type Id } from '@utils/validators';
import { z } from 'zod';

const schema = z.object({
  id,
});

type Dto = (MindmapModel & { id: Id }) | null;

export const getAccessibleMindmapController = controller<Dto>(
  async (rawPayload, context) => {
    const payload = await parse(schema, rawPayload);

    const mindmapRef = context.db
      .collectionGroup(`mindmaps`)
      .where(`__name__`, `==`, payload.id)
      .where(`visibility`, `!=`, Visibility.Private)
      .limit(1);

    const mindmapSnap = (await mindmapRef.get()).docs[0];

    const mindmap = mindmapSnap?.data() as MindmapModel | undefined;

    if (!mindmap) {
      return null;
    }

    return {
      ...mindmap,
      id: mindmapSnap.id,
    };
  },
);
