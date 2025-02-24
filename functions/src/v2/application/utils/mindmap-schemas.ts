import { z } from 'zod';
import {
  clientGeneratedId,
  cords,
  description,
  name,
  text,
  url,
} from './validators';
import {
  MINDMAP_EDGE_TYPES,
  MINDMAP_NODE_TYPES,
  MINDMAP_ORIENTATIONS,
} from '@domain/models/mindmap';

const mindmapEdges = () => {
  const id = clientGeneratedId();

  return z.array(
    z.object({
      id,
      source: id,
      target: id,
      type: z.enum(MINDMAP_EDGE_TYPES),
    }),
  );
};

const mindmapNodes = () => {
  const [externalType, embeddedType] = MINDMAP_NODE_TYPES;
  const id = clientGeneratedId();
  const position = cords();
  const nodeDescription = description().nullable();
  const nodeName = name();

  return z.array(
    z.union([
      z.object({
        id,
        type: z.literal(externalType),
        position,
        data: z.object({
          url: url(`Wrong url format in node`),
          description: nodeDescription,
          name: nodeName,
        }),
      }),
      z.object({
        id,
        type: z.literal(embeddedType),
        position,
        data: z.object({
          content: text.nullable(),
          description: nodeDescription,
          name: nodeName,
        }),
      }),
    ]),
  );
};

const mindmapOrientation = () => z.enum(MINDMAP_ORIENTATIONS);

export { mindmapEdges, mindmapNodes, mindmapOrientation };
