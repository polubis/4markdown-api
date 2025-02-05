import { type MindmapId, MindmapTags, Visibility } from '@domain/atoms/general';
import { type MindmapModel } from '@domain/models/mindmap';
import { nowISO, uuid } from '@libs/helpers/stamps';
import { protectedController } from '@utils/controller';
import { createSlug } from '@utils/create-slug';
import { errors } from '@utils/errors';
import { parse } from '@utils/parse';
import { description, tags } from '@utils/validators';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const schema = z.object({
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
  description: description().nullable(),
  tags: tags().nullable(),
});

type Dto = MindmapModel & { id: MindmapId };

export const createMindmapController = protectedController<Dto>(
  async (rawPayload, context) => {
    const payload = await parse(schema, rawPayload);
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
        throw errors.exists(
          `Mindmap with name ${payload.name.raw} is reserved`,
        );
      }

      const mindmapId = uuid() as MindmapId;
      const tags = payload.tags as MindmapTags;
      const now = nowISO();

      const newMindmap: MindmapModel = {
        cdate: now,
        mdate: now,
        name: payload.name.raw,
        path: payload.name.path,
        description: payload.description ?? null,
        edges: [],
        nodes: [],
        visibility: Visibility.Private,
        orientation: `y`,
        tags: tags ?? null,
      };

      await t.set(
        userMindmapsRef.collection(`mindmaps`).doc(mindmapId),
        newMindmap,
      );
      await t.set(
        userMindmapsRef,
        {
          mindmapsCount: FieldValue.increment(1),
        },
        { merge: true },
      );

      return {
        ...newMindmap,
        id: mindmapId,
      };
    });
  },
);
