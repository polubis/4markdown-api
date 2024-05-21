import { z } from 'zod';
import { createSchema } from '../validation/create-schema';

const creationSchema = z.object({
  token: z.string().uuid(),
});
const usageSchema = creationSchema.pick({ token: true }).merge(
  z.object({
    backupId: z
      .string()
      .regex(/^(\d{2}):(\d{2}):(\d{4})-(\d{2}):(\d{2}):(\d{2})$/),
  }),
);

const CreateBackupPayload = createSchema(creationSchema, `CreateBackupPayload`);
const UseBackupPayload = createSchema(usageSchema, `UseBackupPayload`);

type ICreateBackupPayload = z.infer<typeof creationSchema>;
type IUseBackupPayload = z.infer<typeof usageSchema>;

export type { ICreateBackupPayload, IUseBackupPayload };
export { CreateBackupPayload, UseBackupPayload };
