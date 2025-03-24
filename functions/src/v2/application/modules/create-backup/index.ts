import { adminController } from '@utils/controller';
import { parse } from '@utils/parse';
import { exec } from 'child_process';
import { z } from 'zod';

type Dto = null;

const execPromise = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(
          new Error(`Error executing command: ${error?.message ?? stderr}`),
        );
      }

      return resolve(stdout);
    });
  });
};

const createBackupController = adminController<Dto>(async (rawPayload) => {
  const [{ backupId }, { sourceBucket, backupBucket }] = await Promise.all([
    parse(
      z.object({
        backupId: z
          .string()
          .min(1)
          .regex(
            /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/,
            `Invalid date format. Expected: YYYY-MM-DD_HH-MM-SS`,
          ),
      }),
      rawPayload,
    ),
    parse(
      z.object({
        sourceBucket: z.string().min(1),
        backupBucket: z.string().min(1),
      }),
      {
        sourceBucket: process.env.SOURCE_BUCKET,
        backupBucket: process.env.BACKUP_BUCKET,
      },
    ),
  ]);

  await Promise.all([
    execPromise(
      `gsutil -m cp -r ${sourceBucket}/* ${backupBucket}/${backupId}/storage/`,
    ),
    execPromise(`gcloud firestore export ${backupBucket}/${backupId}/db/`),
  ]);

  return null;
});

export { createBackupController };
