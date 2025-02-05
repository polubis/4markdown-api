import type {
  DocumentId,
  MindmapEdgeId,
  MindmapId,
  MindmapNodeId,
  Tags,
  Visibility,
} from '@domain/atoms/general';
import type { Date, Path, Url } from '@utils/validators';

const enum MindmapNodeType {
  Document = `document`,
  External = `external`,
  Embedded = `embedded`,
  Nested = `nested`,
}

const enum MindmapEdgeType {
  Unvisited = `unvisited`,
  Visited = `visited`,
  Done = `done`,
}

type MakeNode<
  TType extends MindmapNodeType,
  TData extends Record<string, any>,
> = {
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

type MakeEdge<TType extends MindmapEdgeType> = {
  id: MindmapEdgeId;
  type: TType;
  source: MindmapNodeId;
  target: MindmapNodeId;
};

type DocumentNode = MakeNode<
  MindmapNodeType.Document,
  { documentId: DocumentId }
>;
type ExternalNode = MakeNode<MindmapNodeType.External, { url: Url }>;
type EmbeddedNode = MakeNode<MindmapNodeType.Embedded, { content: string }>;
type NestedNode = MakeNode<MindmapNodeType.Nested, { mindmapId: MindmapId }>;
type MindmapNode = DocumentNode | ExternalNode | EmbeddedNode | NestedNode;

type UnvisitedEdge = MakeEdge<MindmapEdgeType.Unvisited>;
type VisitedEdge = MakeEdge<MindmapEdgeType.Visited>;
type DoneEdge = MakeEdge<MindmapEdgeType.Done>;
type MindmapEdge = UnvisitedEdge | VisitedEdge | DoneEdge;

type MindmapModel = {
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

export { MindmapEdgeType, MindmapNodeType };
export type { MindmapModel };
