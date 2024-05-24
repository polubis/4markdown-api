import { Controller } from '../../libs/framework/controller';
import { isAuthenticated } from '../shared/middleware/is-authenticated';
import { CreateDocPayload } from './create-doc.payload';
import { CreateDocService } from './create-doc.service';
import { ICreateDocDto } from './defs';

const createDocController = Controller<ICreateDocDto>(
  async (context, payload) => {
    const auth = isAuthenticated(context);
    const dto = await CreateDocService.create(
      auth.uid,
      await CreateDocPayload.parseAsync(payload),
    );

    return dto;
  },
);

export { createDocController };
