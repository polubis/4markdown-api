import { adminController } from '@utils/controller';
import { createSlug } from '@utils/create-slug';

type Dto = null;

const migrateDatabaseController = adminController<Dto>(async (_, { db }) => {
  await db.runTransaction(async (transaction) => {
    const userProfilesRef = db.collection(`users-profiles`);
    const userProfilesSnapshot = await transaction.get(userProfilesRef);

    userProfilesSnapshot.docs.forEach((doc) => {
      const docData = doc.data();

      const slug =
        docData.displayName === null ? null : createSlug(docData.displayName);
      transaction.update(doc.ref, { displayNameSlug: slug });
    });
  });

  return null;
});

export { migrateDatabaseController };
