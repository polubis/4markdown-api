import { Visibility } from '@domain/atoms/general';
import {
  clientGeneratedId,
  cords,
  description,
  name,
  text,
  url,
  type Date,
  type Path,
} from '@utils/validators';
import { z } from 'zod';

const MINDMAP_EDGE_TYPES = [`solid`] as const;
const MINDMAP_NODE_TYPES = [`external`, `embedded`] as const;
const MINDMAP_ORIENTATIONS = [`x`, `y`] as const;

const clientGeneratedIdSchema = clientGeneratedId();

const mindmapEdgesSchema = z.array(
  z
    .object({
      id: clientGeneratedIdSchema,
      source: clientGeneratedIdSchema,
      target: clientGeneratedIdSchema,
      type: z.enum(MINDMAP_EDGE_TYPES),
    })
    .strict(),
);

const [externalType, embeddedType] = MINDMAP_NODE_TYPES;
const positionSchema = cords();
const nodeDescriptionSchema = description().nullable();
const nodeNameSchema = name();
const urlSchema = url(`Wrong url format in node`);
const textSchema = text.nullable();

const mindmapNodesSchema = z.array(
  z.union([
    z
      .object({
        id: clientGeneratedIdSchema,
        type: z.literal(externalType),
        position: positionSchema,
        data: z
          .object({
            url: urlSchema,
            description: nodeDescriptionSchema,
            name: nodeNameSchema,
          })
          .strict(),
      })
      .strict(),
    z
      .object({
        id: clientGeneratedIdSchema,
        type: z.literal(embeddedType),
        position: positionSchema,
        data: z
          .object({
            content: textSchema.nullable(),
            description: nodeDescriptionSchema,
            name: nodeNameSchema,
          })
          .strict(),
      })
      .strict(),
  ]),
);

type MindmapOrientation = (typeof MINDMAP_ORIENTATIONS)[number];
type MindmapNode = z.infer<typeof mindmapNodesSchema>[number];
type MindmapEdge = z.infer<typeof mindmapEdgesSchema>[number];

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

export {
  MINDMAP_EDGE_TYPES,
  MINDMAP_NODE_TYPES,
  MINDMAP_ORIENTATIONS,
  mindmapEdgesSchema,
  mindmapNodesSchema,
};
export type { MindmapModel, MindmapMetaModel, MindmapNode };
