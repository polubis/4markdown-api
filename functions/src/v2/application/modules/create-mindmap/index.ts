import { protectedController } from '@utils/controller';
import { type MindmapModel } from '@domain/models/mindmap';
import { type Id } from '@utils/validators';
import { z } from 'zod';
import { parse } from '@utils/parse';
import { nowISO, uuid } from '@libs/helpers/stamps';
import { Visibility } from '@domain/atoms/general';
import { FieldValue } from 'firebase-admin/firestore';
import {
  mindmapNameSchema,
  mindmapDescriptionSchema,
  mindmapNodesSchema,
  mindmapEdgesSchema,
  mindmapOrientationSchema,
  mindmapTagsSchema,
} from '@utils/mindmap-schemas';

const payloadSchema = z.object({
  name: mindmapNameSchema,
  description: mindmapDescriptionSchema,
  tags: mindmapTagsSchema,
  nodes: mindmapNodesSchema,
  edges: mindmapEdgesSchema,
  orientation: mindmapOrientationSchema,
});

type Dto = MindmapModel & { id: Id };

const createMindmapController = protectedController<Dto>(
  async (rawPayload, { db, uid }) => {
    const { name, description, nodes, orientation, tags, edges } = await parse(
      payloadSchema,
      rawPayload,
    );

    return db.runTransaction(async (t) => {
      const userMindmapsRef = db.collection(`user-mindmaps`).doc(uid);

      const mindmapId = uuid();
      const now = nowISO();

      const newMindmap: MindmapModel = {
        cdate: now,
        mdate: now,
        name: name.raw,
        path: name.path,
        description: description ?? null,
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        })),
        nodes: nodes.map((node) => {
          if (node.type === `external`) {
            return {
              id: node.id,
              type: node.type,
              position: node.position,
              data: {
                url: node.data.url,
                description: node.data.description,
                name: node.data.name.raw,
                path: node.data.name.path,
              },
            };
          }

          return {
            id: node.id,
            type: node.type,
            position: node.position,
            data: {
              content: node.data.content,
              description: node.data.description,
              name: node.data.name.raw,
              path: node.data.name.path,
            },
          };
        }),
        orientation,
        visibility: Visibility.Private,
        tags: tags ?? null,
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
