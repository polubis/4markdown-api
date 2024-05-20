import { logger } from 'firebase-functions/v1';
import { IBackupPayload } from '../payloads/backup.payload';
import { errors } from '../core/errors';

const BackupsService = {
  create: ({ token }: IBackupPayload): Promise<void> => {
    if (token !== process.env.BACKUP_TOKEN) {
      throw errors.invalidArg(`Wrong token`);
    }

    logger.info(`Backup creation started`);

    return Promise.resolve();
  },
};

export { BackupsService };
