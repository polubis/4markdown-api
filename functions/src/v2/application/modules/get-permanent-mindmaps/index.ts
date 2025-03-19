import { type MindmapModel } from '@domain/models/mindmap';
import { controller } from '@utils/controller';
import { type Id } from '@utils/validators';

type Dto = (MindmapModel & { id: Id })[];

const getPermanentMindmapsController = controller<Dto>(async (_, { db }) => {
  const mindmapsSnap = await db
    .collectionGroup(`mindmaps`)
    .where(`isPermanent`, `==`, true)
    .get();

  return mindmapsSnap.docs.map((doc) => {
    const mindmap = doc.data() as MindmapModel;
    const id = doc.id;
    // const authorId = doc.ref.path.split(`/`)[1];

    return {
      ...mindmap,
      id,
      //   authorId,
    };
  });
});

export { getPermanentMindmapsController };
