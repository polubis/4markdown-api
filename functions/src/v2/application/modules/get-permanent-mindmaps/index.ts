import { Visibility } from '@domain/atoms/general';
import { type MindmapModel } from '@domain/models/mindmap';
import { type UserProfileModel } from '@domain/models/user-profile';
import { controller } from '@utils/controller';
import { parse } from '@utils/parse';
import { type Id } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
});

type DtoItem = MindmapModel & { id: Id; author: UserProfileModel | null };
type Dto = DtoItem[];

const getPermanentMindmapsController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);
    const mindmapsSnap = await db
      .collectionGroup(`mindmaps`)
      .where(`visibility`, `==`, Visibility.Permanent)
      .orderBy(`cdate`, `desc`)
      .limit(payload.limit)
      .get();

    const notFullMindmaps: (Omit<DtoItem, 'author'> & { authorId: Id })[] = [];
    const authorProfiles: Record<Id, UserProfileModel | null> = {};

    const userProfilesRef = db.collection(`users-profiles`);

    for (const mindmapDoc of mindmapsSnap.docs) {
      const mindmapData = mindmapDoc.data() as MindmapModel;
      const authorId = mindmapDoc.ref.parent.parent!.id;

      authorProfiles[authorId] = null;
      notFullMindmaps.push({
        ...mindmapData,
        id: mindmapDoc.id,
        authorId,
      });
    }

    const userProfilesSnap = await userProfilesRef
      .where(`__name__`, `in`, Object.keys(authorProfiles))
      .get();

    userProfilesSnap.docs.forEach((userProfileDoc) => {
      authorProfiles[userProfileDoc.id] =
        (userProfileDoc.data() as UserProfileModel | undefined) ?? null;
    });

    const mindmaps: Dto = notFullMindmaps.map(({ authorId, ...mindmap }) => ({
      ...mindmap,
      author: authorProfiles[authorId],
    }));

    return mindmaps;
  },
);

export { getPermanentMindmapsController };
