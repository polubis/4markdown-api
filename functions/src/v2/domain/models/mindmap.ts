import { type ClientGeneratedId, Visibility } from '@domain/atoms/general';
import type { Date, Path, Url } from '@utils/validators';

const MINDMAP_EDGE_TYPES = [`solid`] as const;
const MINDMAP_NODE_TYPES = [`external`, `embedded`] as const;
const MINDMAP_ORIENTATIONS = [`x`, `y`] as const;

type MindmapEdgeType = (typeof MINDMAP_EDGE_TYPES)[number];
type MindmapNodeType = (typeof MINDMAP_NODE_TYPES)[number];
type MindmapOrientation = (typeof MINDMAP_ORIENTATIONS)[number];

type NodeBase = {
  name: string;
  description: string | null;
  path: Path;
};

type MakeNode<
  TType extends MindmapNodeType,
  TData extends Record<string, any>,
> = {
  id: ClientGeneratedId;
  position: {
    x: number;
    y: number;
  };
  type: TType;
  data: TData;
};

type MakeEdge<TType extends MindmapEdgeType> = {
  id: ClientGeneratedId;
  type: TType;
  source: ClientGeneratedId;
  target: ClientGeneratedId;
};

type ExternalNode = MakeNode<`external`, NodeBase & { url: Url }>;
type EmbeddedNode = MakeNode<`embedded`, NodeBase & { content: string | null }>;
type MindmapNode = ExternalNode | EmbeddedNode;

type SolidEdge = MakeEdge<`solid`>;
type MindmapEdge = SolidEdge;

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
