import { protectedController } from '@utils/controller';
import { MindmapNode, type MindmapModel } from '@domain/models/mindmap';
import {
  mindmapEdges,
  mindmapNodes,
  mindmapOrientation,
} from '@utils/mindmap-schemas';
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
  nodes: mindmapNodes(),
  edges: mindmapEdges(),
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
        nodes: payload.nodes.map<MindmapNode>((node) => {
          if (node.type === `embedded`) {
            return {
              id: node.id,
              position: node.position,
              type: node.type,
              data: {
                name: node.data.name.raw,
                path: node.data.name.path,
                description: node.data.description,
                content: node.data.content,
              },
            };
          }

          return {
            id: node.id,
            position: node.position,
            type: node.type,
            data: {
              name: node.data.name.raw,
              path: node.data.name.path,
              description: node.data.description,
              url: node.data.url,
            },
          };
        }),
        visibility: Visibility.Private,
        orientation: payload.orientation,
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
