import { Visibility } from '@domain/atoms/general';
import { mindmapEdges, mindmapNodes } from '@utils/mindmap-schemas';
import type { Date, Path } from '@utils/validators';
import { z } from 'zod';

const MINDMAP_EDGE_TYPES = [`solid`] as const;
const MINDMAP_NODE_TYPES = [`external`, `embedded`] as const;
const MINDMAP_ORIENTATIONS = [`x`, `y`] as const;

type MindmapOrientation = (typeof MINDMAP_ORIENTATIONS)[number];
type MindmapNode = z.infer<ReturnType<typeof mindmapNodes>>[number];
type MindmapEdge = z.infer<ReturnType<typeof mindmapEdges>>[number];

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
