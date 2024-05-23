import { z } from 'zod';

const Id = z.string();
const Uid = z.string();
const EntityName = z.enum([`docs`, `users-profiles`, `images`]);

export { Id, Uid, EntityName };
