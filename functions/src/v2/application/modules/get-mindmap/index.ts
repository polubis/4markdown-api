import { Visibility } from '@domain/atoms/general';
import { AccountPermissionModel } from '@domain/models/account-permission';
import { type MindmapModel } from '@domain/models/mindmap';
import { type UserProfileModel } from '@domain/models/user-profile';
import { controller } from '@utils/controller';
import { errors } from '@utils/errors';
import { parse } from '@utils/parse';
import { type Id, id } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  mindmapId: id,
  authorId: id,
});

type Dto = MindmapModel & {
  id: Id;
  authorId: Id;
  authorProfile: UserProfileModel | null;
  isAuthorTrusted: boolean;
};

const getMindmapController = controller<Dto>(async (rawPayload, { db }) => {
  const { mindmapId, authorId } = await parse(payloadSchema, rawPayload);

  const [mindmapSnap, authorProfileSnap, accountPermissionsSnap] =
    await Promise.all([
      db
        .collection(`user-mindmaps`)
        .doc(authorId)
        .collection(`mindmaps`)
        .doc(mindmapId)
        .get(),
      db.collection(`users-profiles`).doc(authorId).get(),
      db.collection(`account-permissions`).doc(authorId).get(),
    ]);

  const mindmap = mindmapSnap.data() as MindmapModel | undefined;

  if (!mindmap || mindmap.visibility === Visibility.Private) {
    throw errors.notFound(`Mindmap not found`);
  }

  const accountPermissions = accountPermissionsSnap.data() as
    | AccountPermissionModel
    | undefined;

  const authorProfile = authorProfileSnap.data() as
    | UserProfileModel
    | undefined;

  return {
    ...mindmap,
    id: mindmapId,
    authorId,
    authorProfile: authorProfile ?? null,
    isAuthorTrusted: accountPermissions?.trusted ?? false,
  };
});

export { getMindmapController };
