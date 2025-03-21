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
  authorProfile: UserProfileModel | null;
  isAuthorTrusted: boolean;
  authorId: Id;
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

    const mindmaps: Dto = [];
    const authorProfiles: Record<Id, UserProfileModel | null> = {};
    const accountPermissions: Record<Id, boolean> = {};

    for (const mindmapDoc of mindmapsSnap.docs) {
      const mindmapData = mindmapDoc.data() as MindmapModel;
      const authorId = mindmapDoc.ref.parent.parent!.id;

      authorProfiles[authorId] = null;

      mindmaps.push({
        ...mindmapData,
        id: mindmapDoc.id,
        authorId,
        authorProfile: null,
        isAuthorTrusted: false,
      });
    }

    const [userProfilesSnap, accountPermissionsSnap] = await Promise.all([
      db
        .collection(`users-profiles`)
        .where(`__name__`, `in`, Object.keys(authorProfiles))
        .limit(payload.limit)
        .get(),
      db
        .collection(`account-permissions`)
        .where(`trusted`, `==`, true)
        .limit(payload.limit)
        .get(),
    ]);

    accountPermissionsSnap.docs.forEach((accountPermissionDoc) => {
      accountPermissions[accountPermissionDoc.id] = true;
    });

    userProfilesSnap.docs.forEach((userProfileSnap) => {
      authorProfiles[userProfileSnap.id] =
        (userProfileSnap.data() as UserProfileModel | undefined) ?? null;
    });

    return mindmaps.map((mindmap) => ({
      ...mindmap,
      authorProfile: authorProfiles[mindmap.authorId],
      isAuthorTrusted: !!accountPermissions[mindmap.authorId],
    }));
  },
);

export { getPermanentMindmapsController };
