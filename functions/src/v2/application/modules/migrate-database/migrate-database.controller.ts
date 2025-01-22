import { adminController } from '@utils/controller';
import { createSlug } from '@utils/create-slug';

type Dto = null;

const migrateDatabaseController = adminController<Dto>(async (_, { db }) => {
  await db.runTransaction(async (transaction) => {
    const userProfilesRef = db.collection(`users-profiles`);
    const userDisplayNamesRef = db.collection(`user-display-names`);
    const userProfilesSnapshot = await transaction.get(userProfilesRef);

    userProfilesSnapshot.docs.forEach((doc) => {
      const docData = doc.data();

      const slug =
        docData.displayName === null ? null : createSlug(docData.displayName);
      transaction.update(doc.ref, { displayNameSlug: slug });

      if (slug !== null) {
        transaction.create(userDisplayNamesRef.doc(slug), {
          userId: doc.id,
        });
      }
    });
  });

  return null;
});

export { migrateDatabaseController };
