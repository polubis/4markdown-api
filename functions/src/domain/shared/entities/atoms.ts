import { z } from 'zod';

const Id = z.string().uuid();

export { Id };
