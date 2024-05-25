import { errors } from '../../libs/framework/errors';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { IDeleteDocService } from './defs';

const DeleteDocService: IDeleteDocService = {
  delete: async (uid, payload) => {
    const docsRepository = DocsRepository();
    const docEntity = await docsRepository.getEntity(uid);

    if (!docEntity)
      throw errors.notFound(
        `NOT_FOUND_RECORD`,
        `Cannot find document to delete`,
      );

    delete docEntity[payload.id];

    await docsRepository.updateEntity(uid, docEntity);

    return { id: payload.id };
  },
};

export { DeleteDocService };
