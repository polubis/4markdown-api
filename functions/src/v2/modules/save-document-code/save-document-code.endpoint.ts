import { errors } from '../../libs/framework/errors';
import { controller } from '../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../libs/framework/parse';

const command = {
  parsePayload: async (rawPayload: unknown) => {
    const schema = z.object({
      id: validators.id,
      mdate: validators.date,
      code: z.string(),
    });

    return await parse(schema, rawPayload);
  },
};

const query = {
  safe_payload: async () => {},
};

const saveDocumentCodeController = controller<Response>(
  { authentication: true },
  async (rawPayload) => {
    const payload = await command.parsePayload(rawPayload);

    throw errors.exists();
  },
);

export { saveDocumentCodeController };
