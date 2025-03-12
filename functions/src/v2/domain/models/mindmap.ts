import { Visibility } from '@domain/atoms/general';
import {
  clientGeneratedId,
  cords,
  description,
  id,
  name,
  tags,
  text,
  url,
  type Date,
} from '@utils/validators';
import { z } from 'zod';

const MINDMAP_EDGE_TYPES = [`solid`] as const;
const MINDMAP_NODE_TYPES = [`external`, `embedded`] as const;
const MINDMAP_ORIENTATIONS = [`x`, `y`] as const;

const mindmapVisibilitySchema = z.enum([
  Visibility.Private,
  Visibility.Public,
  Visibility.Permanent,
]);

const mindmapIdSchema = id;
const mindmapNameSchema = name();
const mindmapDescriptionSchema = description().nullable();
const mindmapTagsSchema = tags().nullable();

const clientGeneratedIdSchema = clientGeneratedId();

const mindmapEdgesSchema = z.array(
  z.object({
    id: clientGeneratedIdSchema,
    source: clientGeneratedIdSchema,
    target: clientGeneratedIdSchema,
    type: z.enum(MINDMAP_EDGE_TYPES),
  }),
);

const [externalType, embeddedType] = MINDMAP_NODE_TYPES;
const positionSchema = cords();
const nodeDescriptionSchema = description().nullable();
const nodeNameSchema = name();
const urlSchema = url(`Wrong url format in node`);
const textSchema = text.nullable();
const mindmapOrientationSchema = z.enum(MINDMAP_ORIENTATIONS);

const mindmapNodesSchema = z.array(
  z.union([
    z.object({
      id: clientGeneratedIdSchema,
      type: z.literal(externalType),
      position: positionSchema,
      data: z.object({
        url: urlSchema,
        description: nodeDescriptionSchema,
        name: nodeNameSchema,
      }),
    }),
    z.object({
      id: clientGeneratedIdSchema,
      type: z.literal(embeddedType),
      position: positionSchema,
      data: z.object({
        content: textSchema,
        description: nodeDescriptionSchema,
        name: nodeNameSchema,
      }),
    }),
  ]),
);

type ClientUID = `${number}:${number}`;

type MindmapEdge = {
  id: ClientUID;
  source: ClientUID;
  target: ClientUID;
  type: `solid`;
};

type MindmapNode =
  | {
      type: `external`;
      id: z.infer<typeof clientGeneratedIdSchema>;
      position: z.infer<typeof positionSchema>;
      data: {
        url: string;
        description: string | null;
        name: string;
        path: string;
      };
    }
  | {
      type: `embedded`;
      id: z.infer<typeof clientGeneratedIdSchema>;
      position: z.infer<typeof positionSchema>;
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

type MindmapModelId = z.infer<typeof mindmapIdSchema>;

export {
  MINDMAP_EDGE_TYPES,
  MINDMAP_NODE_TYPES,
  MINDMAP_ORIENTATIONS,
  mindmapEdgesSchema,
  mindmapNodesSchema,
  mindmapOrientationSchema,
  mindmapNameSchema,
  mindmapDescriptionSchema,
  mindmapTagsSchema,
  mindmapIdSchema,
  mindmapVisibilitySchema,
};
export type { MindmapModel, MindmapMetaModel, MindmapNode, MindmapModelId };
