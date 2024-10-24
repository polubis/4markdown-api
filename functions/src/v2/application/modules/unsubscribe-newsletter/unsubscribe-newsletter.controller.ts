import { protectedController } from '../../utils/controller';
import { z } from 'zod';

const payloadSchema = z.object({});

type Dto = {};

const unsubscribeNewsletterController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const ref = db.collection(`newsletter-subscribers`);
  },
);

export { unsubscribeNewsletterController };
