import { Controller } from '../../libs/framework/controller';
import { isAuthenticated } from '../shared/middleware/is-authenticated';
import { IDeleteDocDto } from './defs';
import { DeleteDocPayload } from './delete-doc.payload';
import { DeleteDocService } from './delete-doc.service';

const deleteDocController = Controller<IDeleteDocDto>(
  async (context, payload) => {
    const auth = isAuthenticated(context);
    const dto = await DeleteDocService.delete(
      auth.uid,
      await DeleteDocPayload.parseAsync(payload),
    );

    return dto;
  },
);

export { deleteDocController };
