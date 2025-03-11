import { protectedController } from '@utils/controller';
import {
  mindmapEdgesSchema,
  mindmapNodesSchema,
  type MindmapModel,
} from '@domain/models/mindmap';
import { mindmapOrientation } from '@utils/mindmap-schemas';
import { description, type Id, name, tags } from '@utils/validators';
import { z } from 'zod';
import { parse } from '@utils/parse';
import { errors } from '@utils/errors';
import { nowISO, uuid } from '@libs/helpers/stamps';
import { Visibility } from '@domain/atoms/general';
import { FieldValue } from 'firebase-admin/firestore';

const payloadSchema = z.object({
  name: name(),
  description: description().nullable(),
  tags: tags().nullable(),
  nodes: mindmapNodesSchema,
  edges: mindmapEdgesSchema,
  orientation: mindmapOrientation(),
});

type Dto = MindmapModel & { id: Id };

const createMindmapController = protectedController<Dto>(
  async (rawPayload, context) => {
    const payload = await parse(payloadSchema, rawPayload);

    return context.db.runTransaction(async (t) => {
      const userMindmapsRef = context.db
        .collection(`user-mindmaps`)
        .doc(context.uid);

      const hasDuplicateSnap = await t.get(
        userMindmapsRef
          .collection(`mindmaps`)
          .where(`path`, `==`, payload.name.path)
          .count(),
      );

      const hasDuplicate = hasDuplicateSnap.data().count > 0;

      if (hasDuplicate) {
        throw errors.exists(
          `Mindmap with name ${payload.name.raw} is already taken`,
        );
      }

      const mindmapId = uuid();
      const now = nowISO();

      const newMindmap: MindmapModel = {
        cdate: now,
        mdate: now,
        name: payload.name.raw,
        path: payload.name.path,
        description: payload.description ?? null,
        edges: payload.edges,
        nodes: payload.nodes,
        orientation: payload.orientation,
        visibility: Visibility.Private,
        tags: payload.tags ?? null,
      };

      t.set(userMindmapsRef.collection(`mindmaps`).doc(mindmapId), newMindmap);
      t.set(
        userMindmapsRef,
        {
          mindmapsCount: FieldValue.increment(1),
        },
        { merge: true },
      );

      return {
        ...newMindmap,
        id: mindmapId,
      };
    });
  },
);

export { createMindmapController };
