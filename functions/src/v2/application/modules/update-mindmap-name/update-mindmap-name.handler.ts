import { errors } from '@utils/errors';

import { type ProtectedControllerHandlerContext } from '@utils/controller';
import { type MindmapModel } from '@domain/models/mindmap';
import type {
  UpdateMindmapNameDto,
  UpdateMindmapNamePayload,
} from './update-mindmap-name.contract';
import { nowISO } from '@libs/helpers/stamps';

const updateMindmapNameHandler = async ({
  payload,
  context,
}: {
  payload: UpdateMindmapNamePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateMindmapNameDto> => {
  return context.db.runTransaction(
    async (t) => {
      const userMindmapsRef = context.db
        .collection(`user-mindmaps`)
        .doc(context.uid);
      const mindmapRef = userMindmapsRef.collection(`mindmaps`).doc(payload.id);

      const [hasDuplicateSnap, mindmapSnap] = await Promise.all([
        t.get(
          userMindmapsRef
            .collection(`mindmaps`)
            .where(`path`, `==`, payload.name.path)
            .where(`__name__`, `!=`, payload.id)
            .count(),
        ),
        t.get(mindmapRef),
      ]);

      const mindmapData = mindmapSnap.data() as MindmapModel | undefined;

      if (!mindmapData) {
        throw errors.notFound(`Cannot find mindmap`);
      }

      if (mindmapData.mdate !== payload.mdate) {
        throw errors.outOfDate(`Mindmap has been already changed`);
      }

      const hasDuplicate = hasDuplicateSnap.data().count > 0;

      if (hasDuplicate) {
        throw errors.exists(
          `Mindmap with name ${payload.name.raw} is already taken`,
        );
      }

      const newMindmap: MindmapModel = {
        ...mindmapData,
        name: payload.name.raw,
        path: payload.name.path,
        mdate: nowISO(),
      };

      t.update(mindmapRef, {
        name: newMindmap.name,
        path: newMindmap.path,
        mdate: newMindmap.mdate,
      });

      return {
        id: payload.id,
        ...newMindmap,
      };
    },
    { maxAttempts: 1 },
  );
};

export { updateMindmapNameHandler };
