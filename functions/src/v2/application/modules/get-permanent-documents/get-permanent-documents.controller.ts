import type {
  DocumentModel,
  PermanentDocumentModel,
} from '../../../domain/models/document';
import { controller } from '../../utils/controller';
import type { Id } from '../../utils/validators';

type Dto = {};

// try {
// const [docsCollection, usersProfiles] = await Promise.all([
//   admin.firestore().collection(`docs`).get(),
//   UsersProfilesService.getAll(),
// ]);
//   const docs = docsCollection.docs;

//   return docs
//     .reduce<GetPermanentDocsDto>((acc, doc) => {
//       Object.entries(doc.data()).forEach(
//         ([id, field]: [string, DocEntityField]) => {
//           if (field.visibility === `permanent`) {
//             acc.push({
//               id,
//               cdate: field.cdate,
//               mdate: field.mdate,
//               name: field.name,
//               description: field.description,
//               path: field.path,
//               code: field.code,
//               visibility: field.visibility,
//               tags: field.tags ?? [],
//               author: usersProfiles[doc.id] ?? null,
//             });
//           }
//         },
//       );

//       return acc;
//     }, [] as GetPermanentDocsDto)
//     .sort((prev, curr) => {
//       if (prev.cdate > curr.cdate) return -1;
//       if (prev.cdate === curr.cdate) return 0;
//       return 1;
//     });
// } catch (err) {
//   throw errors.internal(`Server error`);
// }

// const usersProfilesCollection = await admin
// .firestore()
// .collection(`users-profiles`)
// .get();

// const usersProfiles =
// usersProfilesCollection.docs.reduce<UsersProfilesLookup>(
//   (acc, profile) => {
//     acc[profile.id] = profile.data() as IUserProfileEntity;
//     return acc;
//   },
//   {} as UsersProfilesLookup,
// );

// return usersProfiles;

const getPermanentDocumentsController = controller(async (_, { db }) => {
  const [documentsSnap, usersProfilesSnap] = await Promise.all([
    db.collection(`docs`).get(),
    db.collection(`users-profiles`).get(),
    // UsersProfilesService.getAll(),
  ]);

  const permanentDocuments: (PermanentDocumentModel & {
    id: Id;
  })[] = [];

  documentsSnap.forEach((documentsListSnap) => {
    const documentsListData = Object.entries(documentsListSnap.data());

    documentsListData.forEach(([id, document]: [Id, DocumentModel]) => {
      if (document.visibility === `permanent`) {
        permanentDocuments.push({
          ...document,
          id,
        });
      }
    });
  });
});

export { getPermanentDocumentsController };
