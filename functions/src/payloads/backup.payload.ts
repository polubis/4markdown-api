import { z } from 'zod';
import { createSchema } from '../validation/create-schema';

const schema = z.object({
  token: z.string().uuid(),
});

const BackupPayload = createSchema(schema, `BackupPayload`);

type IBackupPayload = z.infer<typeof schema>;

export type { IBackupPayload };
export { BackupPayload };
