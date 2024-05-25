import { z } from 'zod';
import { Id } from '../shared/entities/atoms';

const DeleteDocPayload = z.object({
  id: Id,
});

export { DeleteDocPayload };
