import { nowISO, uuid } from '@libs/helpers/stamps';
import { errors } from '@utils/errors';
import type {
  CreateMindmapDto,
  CreateMindmapPayload,
} from './create-mindmap.contract';
import { type ProtectedControllerHandlerContext } from '@utils/controller';
import { MindmapNode, type MindmapModel } from '@domain/models/mindmap';
import { FieldValue } from 'firebase-admin/firestore';
import { Visibility } from '@domain/atoms/general';

const createMindmapHandler = async ({
  payload,
  context,
}: {
  payload: CreateMindmapPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<CreateMindmapDto> => {
  return context.db.runTransaction(async (t) => {
    const userMindmapsRef = context.db
      .collection(`user-mindmaps`)
      .doc(context.uid);

    const hasDuplicateSnapshot = await t.get(
      userMindmapsRef
        .collection(`mindmaps`)
        .where(`path`, `==`, payload.name.path)
        .count(),
    );

    const hasDuplicate = hasDuplicateSnapshot.data().count > 0;

    if (hasDuplicate) {
      throw errors.exists(`Mindmap with name ${payload.name.raw} is reserved`);
    }

    const mindmapId = uuid();
    const tags = payload.tags;
    const now = nowISO();

    const newNodes = payload.nodes.map<MindmapNode>((node) => {
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
    });

    const newMindmap: MindmapModel = {
      cdate: now,
      mdate: now,
      name: payload.name.raw,
      path: payload.name.path,
      description: payload.description ?? null,
      edges: payload.edges,
      nodes: newNodes,
      visibility: Visibility.Private,
      orientation: `y`,
      tags: tags ?? null,
    };

    await t.set(
      userMindmapsRef.collection(`mindmaps`).doc(mindmapId),
      newMindmap,
    );

    await t.set(
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
};

export { createMindmapHandler };
