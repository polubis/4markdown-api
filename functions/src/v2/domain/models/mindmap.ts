import { Visibility } from '@domain/atoms/general';
import type { ClientGeneratedId, Date, Path, Url } from '@utils/validators';

const MINDMAP_EDGE_TYPES = [`solid`] as const;
const MINDMAP_NODE_TYPES = [`external`, `embedded`] as const;
const MINDMAP_ORIENTATIONS = [`x`, `y`] as const;

type MindmapEdgeType = (typeof MINDMAP_EDGE_TYPES)[number];
type MindmapNodeType = (typeof MINDMAP_NODE_TYPES)[number];

type MakeEdge<TType extends MindmapEdgeType> = {
  id: ClientGeneratedId;
  source: ClientGeneratedId;
  target: ClientGeneratedId;
  type: TType;
};

type MakeNode<
  TType extends MindmapNodeType,
  TData extends Record<string, any>,
> = {
  id: ClientGeneratedId;
  type: TType;
  position: {
    x: number;
    y: number;
  };
  data: TData & {
    name: string;
    description: string | null;
    path: Path;
  };
};

type MindmapOrientation = (typeof MINDMAP_ORIENTATIONS)[number];
type MindmapNode =
  | MakeNode<`external`, { url: Url }>
  | MakeNode<`embedded`, { content: string | null }>;
type MindmapEdge = MakeEdge<`solid`>;

type MindmapModel = {
  cdate: Date;
  mdate: Date;
  path: Path;
  name: string;
  orientation: MindmapOrientation;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  visibility: Visibility;
  description: string | null;
  tags: string[] | null;
};

type MindmapMetaModel = {
  mindmapsCount: number;
};

export { MINDMAP_EDGE_TYPES, MINDMAP_NODE_TYPES, MINDMAP_ORIENTATIONS };
export type { MindmapModel, MindmapMetaModel, MindmapNode };
