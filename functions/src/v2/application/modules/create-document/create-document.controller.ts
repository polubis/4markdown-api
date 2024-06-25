import { z } from 'zod';
import { protectedController } from '../../../libs/framework/controller';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';

const payloadSchema = z.object({
  name: validators.document.name,
  code: validators.document.code,
});

// const { code } = payload;
// const id = uuid();
// const cdate = new Date().toISOString();

// const field: DocEntityField = {
//   name: Doc.createName(payload.name, `private`),
//   code,
//   cdate,
//   mdate: cdate,
//   visibility: `private`,
// };

// const docsCollection = admin
//   .firestore()
//   .collection(`docs`)
//   .doc(context.auth.uid);
// const docs = await docsCollection.get();

// const dto: CreateDocDto = {
//   ...field,
//   id,
// };

// if (!docs.exists) {
//   await docsCollection.set(<DocEntity>{
//     [id]: field,
//   });
//   return dto;
// }

// const fields = docs.data() as DocEntity;
// const alreadyExist = Object.values(fields).some((f) => f.name === field.name);

// if (alreadyExist) {
//   throw new HttpsError(
//     `already-exists`,
//     `Document with provided name already exist`,
//   );
// }

// const docEntity: DocEntity = {
//   ...fields,
//   [id]: field,
// };

// await docsCollection.set(docEntity);

// return dto;

const createDocumentController = protectedController(
  async (rawPayload, { uid }) => {
    const [payload, bucket] = await Promise.all([
      parse(payloadSchema, rawPayload),
      getDefaultBucket(),
    ]);

    const { id, location, url } = generateMetadata({
      uid,
      bucketName: bucket.name,
    });
    const { contentType, extension, buffer } = payload.image;
    const file = bucket.file(location);

    await Promise.all([
      file.save(buffer, { contentType }),
      saveImageMetadata({
        uid,
        model: {
          [id]: {
            url,
            contentType,
            extension,
          },
        },
      }),
    ]);

    return {
      extension,
      contentType,
      url,
      id,
    };
  },
);

export { createDocumentController };
