import { controller } from '../../utils/controller';

type Dto = {};

// try {
//   const [docsCollection, usersProfiles] = await Promise.all([
//     admin.firestore().collection(`docs`).get(),
//     UsersProfilesService.getAll(),
//   ]);
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

const getPermanentDocumentsController = controller(
  async (_, { uid, db }) => {},
);

export { getPermanentDocumentsController };
