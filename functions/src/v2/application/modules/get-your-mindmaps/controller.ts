import { MindmapMetaModel, type MindmapModel } from '@domain/models/mindmap';
import { protectedController } from '@utils/controller';
import { type Id } from '@utils/validators';

type DtoMindmap = MindmapModel & { id: Id };

type Dto = {
  mindmaps: DtoMindmap[];
} & MindmapMetaModel;

export const getYourMindmapsController = protectedController<Dto>(
  async (_, context) => {
    const yourMindmapsRef = context.db
      .collection(`user-mindmaps`)
      .doc(context.uid);

    const yourMindmapsMetaSnap = await yourMindmapsRef.get();

    const yourMindmapsMeta = yourMindmapsMetaSnap.data() as
      | { mindmapsCount: number }
      | undefined;

    if (!yourMindmapsMeta || yourMindmapsMeta.mindmapsCount === 0) {
      return {
        mindmaps: [],
        mindmapsCount: 0,
      };
    }

    const yourMindmapsSnap = await yourMindmapsRef.collection(`mindmaps`).get();

    const yourMindmaps = yourMindmapsSnap.docs.map((mindmap) => {
      const id = mindmap.id;
      const data = mindmap.data() as MindmapModel;

      return {
        id,
        ...data,
      };
    });

    return {
      mindmaps: yourMindmaps,
      mindmapsCount: yourMindmaps.length,
    };
  },
);
