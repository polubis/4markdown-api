import { Visibility } from '@domain/atoms/general';
import { type MindmapModel } from '@domain/models/mindmap';
import { controller } from '@utils/controller';
import { errors } from '@utils/errors';
import { parse } from '@utils/parse';
import { type Id, id } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  mindmapId: id,
  authorId: id,
});

type Dto = MindmapModel & { id: Id; authorId: Id };

const getMindmapController = controller<Dto>(async (rawPayload, { db }) => {
  const { mindmapId, authorId } = await parse(payloadSchema, rawPayload);

  const mindmapSnap = await db
    .collection(`user-mindmaps`)
    .doc(authorId)
    .collection(`mindmaps`)
    .doc(mindmapId)
    .get();

  const mindmap = mindmapSnap.data() as MindmapModel | undefined;

  if (!mindmap || mindmap.visibility === Visibility.Private) {
    throw errors.notFound(`Mindmap not found`);
  }

  return {
    ...mindmap,
    id: mindmapId,
    authorId,
  };
});

export { getMindmapController };
