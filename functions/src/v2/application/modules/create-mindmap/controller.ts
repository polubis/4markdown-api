import { MindmapId, Visibility } from '@domain/atoms/general';
import { MindmapDto } from '@domain/models/mindmap';
import { nowISO, uuid } from '@libs/helpers/stamps';
import { protectedController } from '@utils/controller';
import { createSlug } from '@utils/create-slug';
import { errors } from '@utils/errors';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .transform((name) => {
        const slug = createSlug(name);

        return {
          raw: name,
          path: `/${slug}/`,
          slug,
          segments: slug === `` ? [] : slug.split(`-`),
        };
      })
      .superRefine(({ segments, raw }, { addIssue }) => {
        if (!(raw.length >= 1 && raw.length <= 70)) {
          addIssue({
            code: `custom`,
            message: `Mindmap name must be between 1-70 characters`,
          });
        }

        if (!(segments.length >= 1 && segments.length <= 15)) {
          addIssue({
            code: `custom`,
            message: `Generated path from mindmap name must be between 1-15`,
          });
        }
      }),
    description: z
      .string()
      .trim()
      .min(110, `Description must be at least 110 characters`)
      .max(160, `Description must be fewer than 160 characters`)
      .optional(),
  })
  .brand(`payload`);

type Payload = z.infer<typeof schema>;

type Dto = MindmapDto;

const validate = async (rawPayload: unknown): Promise<Payload> => {
  try {
    return await schema.parseAsync(rawPayload);
  } catch (error: unknown) {
    throw errors.schema(error);
  }
};

const createMindmapController = protectedController<Dto>(
  async (rawPayload, context) => {
    const payload = await validate(rawPayload);

    return context.db.runTransaction(async (t) => {
      const userMindmapsRef = context.db
        .collection(`user-mindmaps`)
        .doc(context.uid);

      const hasDuplicateSnapshot = await t.get(
        userMindmapsRef
          .collection(`mindmaps`)
          .where(`path`, `==`, payload.name.path)
          .count(),
      );

      const hasDuplicate = hasDuplicateSnapshot.data().count > 0;

      if (hasDuplicate) {
        throw errors.exists(`Mindmap with ${payload.name.raw} already exists`);
      }

      const mindmapId = uuid() as MindmapId;
      const now = nowISO();

      const newMindmap: MindmapDto = {
        cdate: now,
        mdate: now,
        name: payload.name.raw,
        path: payload.name.path,
        description: payload.description ?? null,
        edges: [],
        nodes: [],
        visibility: Visibility.Private,
        orientation: `y`,
      };

      await t.set(
        userMindmapsRef.collection(`mindmaps`).doc(mindmapId),
        newMindmap,
      );
      await t.update(userMindmapsRef, {
        mindmapsCount: FieldValue.increment(1),
      });

      return newMindmap;
    });
  },
);

export { createMindmapController };
