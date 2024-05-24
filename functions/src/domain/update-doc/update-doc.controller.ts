import { Controller } from '../../libs/framework/controller';
import { isAuthenticated } from '../shared/middleware/is-authenticated';
import { UpdateDocPayload } from './update-doc.payload';
import { UpdateDocService } from './update-doc.service';

const updateDocController = Controller<void>(async (context, payload) => {
  const auth = isAuthenticated(context);
  await UpdateDocService.update(
    auth.uid,
    await UpdateDocPayload.parseAsync(payload),
  );
});

export { updateDocController };
