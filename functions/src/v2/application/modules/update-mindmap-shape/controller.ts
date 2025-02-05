import {
  MINDMAP_EDGE_TYPES,
  MINDMAP_NODE_TYPES,
  type MindmapModel,
} from '@domain/models/mindmap';
import { nowISO } from '@libs/helpers/stamps';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';
import { date, id, text, url } from '@utils/validators';
import { z } from 'zod';

const [documentType, externalType, embeddedType, nestedType] =
  MINDMAP_NODE_TYPES;

const schema = z.object({
  id,
  mdate: date,
  nodes: z.array(
    z.union([
      z.object({
        type: z.literal(documentType),
        documentId: id,
      }),
      z.object({
        type: z.literal(externalType),
        url: url(`Wrong url format in node`),
      }),
      z.object({
        type: z.literal(embeddedType),
        content: text,
      }),
      z.object({
        type: z.literal(nestedType),
        mindmapId: id,
      }),
    ]),
  ),
  edges: z.array(
    z.object({
      id: date,
      source: id,
      target: id,
      type: z.enum(MINDMAP_EDGE_TYPES),
    }),
  ),
});

type Payload = z.infer<typeof schema>;

type Dto = Pick<MindmapModel, 'mdate'>;

const validate = async (rawPayload: unknown): Promise<Payload> => {
  try {
    return await schema.parseAsync(rawPayload);
  } catch (error: unknown) {
    throw errors.schema(error);
  }
};

const updateMindmapShapeController = protectedController<Dto>(
  async (rawPayload, context) => {
    const payload = await validate(rawPayload);

    return context.db.runTransaction(async (t) => {
      const userMindmapRef = context.db
        .collection(`user-mindmaps`)
        .doc(context.uid)
        .collection(`mindmaps`)
        .doc(payload.id);

      const userMindmapSnap = await t.get(userMindmapRef);

      const userMindmap = userMindmapSnap.data() as MindmapModel | undefined;

      if (!userMindmap) {
        throw errors.notFound(`Cannot find mindmap to update`);
      }

      if (userMindmap.mdate !== payload.mdate) {
        throw errors.outOfDate(
          `Cannot update mindmap structure because it's already changed`,
        );
      }

      const mdate = nowISO();

      await t.update(userMindmapRef, {
        mdate,
        nodes: payload.nodes,
        edges: payload.edges,
      });

      return { mdate };
    });
  },
);

export { updateMindmapShapeController };
