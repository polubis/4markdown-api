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

type DtoItem = MindmapModel & {
  id: Id;
  author: UserProfileModel | null;
  isAuthorTrusted: boolean;
};
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

    if (mindmapsSnap.docs.length === 0) {
      return [];
    }

    const notFullMindmaps: (Omit<DtoItem, 'author' | 'isAuthorTrusted'> & {
      authorId: Id;
    })[] = [];
    const authorProfiles: Record<Id, UserProfileModel | null> = {};
    const accountPermissions: Record<Id, boolean> = {};

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

    const [userProfilesSnap, accountPermissionsSnap] = await Promise.all([
      db
        .collection(`users-profiles`)
        .where(`__name__`, `in`, Object.keys(authorProfiles))
        .get(),
      db.collection(`account-permissions`).where(`trusted`, `==`, true).get(),
    ]);

    accountPermissionsSnap.docs.forEach((accountPermissionDoc) => {
      accountPermissions[accountPermissionDoc.id] = true;
    });

    userProfilesSnap.docs.forEach((userProfileSnap) => {
      authorProfiles[userProfileSnap.id] =
        (userProfileSnap.data() as UserProfileModel | undefined) ?? null;
    });

    const mindmaps: Dto = notFullMindmaps.map(({ authorId, ...mindmap }) => ({
      ...mindmap,
      author: authorProfiles[authorId],
      isAuthorTrusted: !!accountPermissions[authorId],
    }));

    return mindmaps;
  },
);

export { getPermanentMindmapsController };
