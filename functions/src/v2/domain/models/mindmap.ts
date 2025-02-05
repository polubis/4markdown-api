import type {
  DocumentId,
  MindmapEdgeId,
  MindmapId,
  MindmapNodeId,
  Tags,
  Visibility,
} from '@domain/atoms/general';
import type { Date, Path, Url } from '@utils/validators';

type MakeNode<TType extends string, TData extends Record<string, any>> = {
  id: MindmapNodeId;
  position: {
    x: number;
    y: number;
  };
  type: TType;
  data: TData & {
    name: string;
    description: string | null;
  };
};

type MakeEdge<TType extends string> = {
  id: MindmapEdgeId;
  type: TType;
  source: MindmapNodeId;
  target: MindmapNodeId;
};

type DocumentNode = MakeNode<`document`, { documentId: DocumentId }>;
type ExternalNode = MakeNode<`external`, { url: Url }>;
type EmbeddedNode = MakeNode<`embedded`, { content: string }>;
type NestedNode = MakeNode<`nested`, { mindmapId: MindmapId }>;
type MindmapNode = DocumentNode | ExternalNode | EmbeddedNode | NestedNode;

type UnvisitedEdge = MakeEdge<`unvisited`>;
type VisitedEdge = MakeEdge<`visited`>;
type DoneEdge = MakeEdge<`done`>;
type MindmapEdge = UnvisitedEdge | VisitedEdge | DoneEdge;

export type MindmapModel = {
  cdate: Date;
  mdate: Date;
  path: Path;
  name: string;
  orientation: `x` | `y`;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  visibility: Visibility;
  description: string | null;
  tags: Tags | null;
};
