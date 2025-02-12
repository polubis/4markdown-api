import type { Visibility } from '@domain/atoms/general';
import type { Date, Path, Url } from '@utils/validators';

const MINDMAP_EDGE_TYPES = [`unvisited`, `visited`, `done`] as const;
const MINDMAP_NODE_TYPES = [
  `document`,
  `external`,
  `embedded`,
  `nested`,
] as const;
const MINDMAP_ORIENTATIONS = [`x`, `y`] as const;

type MindmapEdgeType = (typeof MINDMAP_EDGE_TYPES)[number];
type MindmapNodeType = (typeof MINDMAP_NODE_TYPES)[number];
type MindmapOrientation = (typeof MINDMAP_ORIENTATIONS)[number];

type MakeNode<
  TType extends MindmapNodeType,
  TData extends Record<string, any>,
> = {
  id: string;
  position: {
    x: number;
    y: number;
  };
  type: TType;
  data: TData & {
    name: string;
    description: string | null;
    path: Path;
  };
};

type MakeEdge<TType extends MindmapEdgeType> = {
  id: string;
  type: TType;
  source: string;
  target: string;
};

type DocumentNode = MakeNode<`document`, { documentId: string }>;
type ExternalNode = MakeNode<`external`, { url: Url }>;
type EmbeddedNode = MakeNode<`embedded`, { content: string }>;
type NestedNode = MakeNode<`nested`, { mindmapId: string }>;
type MindmapNode = DocumentNode | ExternalNode | EmbeddedNode | NestedNode;

type UnvisitedEdge = MakeEdge<`unvisited`>;
type VisitedEdge = MakeEdge<`visited`>;
type DoneEdge = MakeEdge<`done`>;
type MindmapEdge = UnvisitedEdge | VisitedEdge | DoneEdge;

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
export type { MindmapModel, MindmapMetaModel };
