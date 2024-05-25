import { z } from 'zod';
import { Id } from '../shared/entities/atoms';

const DeleteDocDto = z.object({
  id: Id,
});

export { DeleteDocDto };
