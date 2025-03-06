import { errors } from '@utils/errors';

import { type ProtectedControllerHandlerContext } from '@utils/controller';
import { MindmapNode, type MindmapModel } from '@domain/models/mindmap';

import { nowISO } from '@libs/helpers/stamps';
import type {
  UpdateMindmapShapeDto,
  UpdateMindmapShapePayload,
} from './update-mindmap-shape.contract';

const updateMindmapShapeHandler = async ({
  payload,
  context,
}: {
  payload: UpdateMindmapShapePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateMindmapShapeDto> => {
  return context.db.runTransaction(
    async (t) => {
      const userMindmapsRef = context.db
        .collection(`user-mindmaps`)
        .doc(context.uid);
      const mindmapRef = userMindmapsRef.collection(`mindmaps`).doc(payload.id);

      const mindmapSnap = await t.get(mindmapRef);

      const mindmapData = mindmapSnap.data() as MindmapModel | undefined;

      if (!mindmapData) {
        throw errors.notFound(`Cannot find mindmap`);
      }

      if (mindmapData.mdate !== payload.mdate) {
        throw errors.outOfDate(`Mindmap has been already changed`);
      }

      const updatedMindmap: MindmapModel = {
        ...mindmapData,
        orientation: payload.orientation,
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
        edges: payload.edges,
        mdate: nowISO(),
      };

      t.update(mindmapRef, {
        mdate: updatedMindmap.mdate,
        nodes: updatedMindmap.nodes,
        edges: updatedMindmap.edges,
        orientation: updatedMindmap.orientation,
      });

      return {
        id: payload.id,
        ...updatedMindmap,
      };
    },
    { maxAttempts: 1 },
  );
};

export { updateMindmapShapeHandler };
