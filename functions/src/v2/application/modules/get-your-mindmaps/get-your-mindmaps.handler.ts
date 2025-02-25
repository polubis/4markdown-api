import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type GetYourMindmapsDto,
  type GetYourMindmapsPayload,
} from './get-your-mindmaps.contract';
import { MindmapModel } from '@domain/models/mindmap';

const getYourMindmapsHandler = async ({
  context,
}: {
  payload: GetYourMindmapsPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<GetYourMindmapsDto> => {
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
};

export { getYourMindmapsHandler };
