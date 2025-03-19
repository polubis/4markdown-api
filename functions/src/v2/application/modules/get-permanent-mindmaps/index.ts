import { Visibility } from '@domain/atoms/general';
import { type MindmapModel } from '@domain/models/mindmap';
import { controller } from '@utils/controller';
import { type Id } from '@utils/validators';

type Dto = (MindmapModel & { id: Id })[];

const getPermanentMindmapsController = controller<Dto>(async (_, { db }) => {
  const mindmapsQuery = db
    .collectionGroup(`mindmaps`)
    .where(`visibility`, `==`, Visibility.Permanent);

  const mindmapsSnap = await mindmapsQuery.get();

  return mindmapsSnap.docs.map((doc) => ({
    ...(doc.data() as MindmapModel),
    id: doc.id,
  }));
});

export { getPermanentMindmapsController };
