import { Visibility } from '@domain/atoms/general';
import {
  clientGeneratedId,
  cords,
  description,
  id,
  markdown,
  name,
  tags,
  url,
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
        content: markdown(`Node content`).nullable(),
        description: nodeDescriptionSchema,
        name: nodeNameSchema,
      }),
    }),
  ]),
);

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
