import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import { MindmapModel } from '@domain/models/mindmap';
import { date } from '@utils/validators';
import { errors } from '@utils/errors';
import { nowISO } from '@libs/helpers/stamps';
import { z } from 'zod';
import {
  mindmapEdgesSchema,
  mindmapIdSchema,
  mindmapNodesSchema,
  mindmapOrientationSchema,
} from '@utils/mindmap-schemas';

const updateMindmapShapePayloadSchema = z.object({
  id: mindmapIdSchema,
  mdate: date,
  nodes: mindmapNodesSchema,
  edges: mindmapEdgesSchema,
  orientation: mindmapOrientationSchema,
});

type Dto = Pick<MindmapModel, `mdate` | `nodes` | `edges` | `orientation`>;

const updateMindmapShapeController = protectedController<Dto>(
  async (rawPayload, context) => {
    const payload = await parse(updateMindmapShapePayloadSchema, rawPayload);
    const userMindmapsRef = context.db
      .collection(`user-mindmaps`)
      .doc(context.uid);
    const mindmapRef = userMindmapsRef.collection(`mindmaps`).doc(payload.id);

    const mindmapSnap = await mindmapRef.get();

    const mindmapData = mindmapSnap.data() as MindmapModel | undefined;

    if (!mindmapData) {
      throw errors.notFound(`Cannot find mindmap`);
    }

    if (mindmapData.mdate !== payload.mdate) {
      throw errors.outOfDate(`Mindmap has been already changed`);
    }

    const updatedMindmap: Dto = {
      orientation: payload.orientation,
      nodes: payload.nodes.map((node) => {
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
      edges: payload.edges,
      mdate: nowISO(),
    };

    await mindmapRef.update(updatedMindmap);

    return updatedMindmap;
  },
);

export { updateMindmapShapeController };
