import { Visibility } from '@domain/atoms/general';
import { Id, type Date } from '@utils/validators';

type ClientUID = `${number}:${number}`;

type MindmapEdge = {
  id: ClientUID;
  source: ClientUID;
  target: ClientUID;
  type: `solid`;
};

type MindmapPosition = {
  x: number;
  y: number;
};

type MindmapNode =
  | {
      type: `external`;
      id: ClientUID;
      position: MindmapPosition;
      data: {
        url: string;
        description: string | null;
        name: string;
        path: string;
      };
    }
  | {
      type: `embedded`;
      id: ClientUID;
      position: MindmapPosition;
      data: {
        content: string | null;
        description: string | null;
        name: string;
        path: string;
      };
    };

type MindmapModel = {
  cdate: Date;
  mdate: Date;
  path: string;
  name: string;
  orientation: `x` | `y`;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  visibility: Visibility;
  description: string | null;
  tags: string[] | null;
};

type MindmapMetaModel = {
  mindmapsCount: number;
};

type MindmapModelId = Id;

export type { MindmapModel, MindmapMetaModel, MindmapNode, MindmapModelId };
