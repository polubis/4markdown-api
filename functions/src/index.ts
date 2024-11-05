import 'module-alias/register';
import * as admin from 'firebase-admin';
import { UsersService } from './services/users.service';
import { UsersProfilesService } from './services/users-profiles.service';
import { updateDocumentCodeController } from './v2/application/modules/update-document-code/update-document-code.controller';
import { rateDocumentController } from './v2/application/modules/rate-document/rate-document.controller';
import { deleteDocumentController } from './v2/application/modules/delete-document/delete-document.controller';
import { getPermanentDocumentsController } from './v2/application/modules/get-permanent-documents/get-permanent-documents.controller';
import { getAccessibleDocumentController } from './v2/application/modules/get-accessible-document/get-accessible-document.controller';
import { createDocumentController } from './v2/application/modules/create-document/create-document.controller';
import { getYourDocumentsController } from './v2/application/modules/get-your-documents/get-your-documents.controller';
import { updateDocumentNameController } from './v2/application/modules/update-document-name/update-document-name.controller';
import {
  CreateBackupPayload,
  UseBackupPayload,
} from './payloads/backup.payload';
import { BackupsService } from './services/backup.service';
import { onSchedule } from 'firebase-functions/scheduler';
import { onCall } from 'firebase-functions/https';
import { updateDocumentVisibilityController } from '@modules/update-document-visibility/update-document-visibility.controller';
import { isDev } from '@utils/is-dev';

const app = admin.initializeApp();
const db = app.firestore();
const projectId = app.options.projectId!;

export const uploadImage = onCall({ maxInstances: 2 }, async (request) => {
  return await UsersService.uploadImage({
    payload: request.data,
    context: {
      auth: request.auth,
    },
  });
});

export const updateYourUserProfile = onCall<unknown>(
  { maxInstances: 2 },
  async (request) => {
    return await UsersProfilesService.updateYour({
      payload: request.data,
      context: {
        auth: request.auth,
      },
    });
  },
);

export const getYourUserProfile = onCall<unknown>(
  { maxInstances: 2 },
  async (request) => {
    return await UsersProfilesService.getYour({
      context: {
        auth: request.auth,
      },
    });
  },
);

export const useBackup = onCall<unknown>(
  { maxInstances: 2 },
  async (request) => {
    await BackupsService.use(projectId, UseBackupPayload(request.data));
  },
);

export const createBackup = onCall<unknown>(
  { maxInstances: 2 },
  async (request) => {
    await BackupsService.create(projectId, CreateBackupPayload(request.data));
  },
);

export const autoCreateBackup = onSchedule(
  { schedule: `59 23 * * 0`, maxInstances: 1 },
  async () => {
    // every sunday 23:59
    if (isDev(projectId)) return;

    await BackupsService.create(
      projectId,
      CreateBackupPayload({
        token: process.env.BACKUP_TOKEN,
      }),
    );
  },
);

export const updateDocumentCode = updateDocumentCodeController({
  db,
  projectId,
});
export const rateDocument = rateDocumentController({
  db,
  projectId,
});
export const deleteDocument = deleteDocumentController({ db, projectId });
export const getPermanentDocuments = getPermanentDocumentsController({
  db,
  projectId,
});
export const getAccessibleDocument = getAccessibleDocumentController({
  db,
  projectId,
});
export const createDocument = createDocumentController({ db, projectId });
export const getYourDocuments = getYourDocumentsController({ db, projectId });
export const updateDocumentName = updateDocumentNameController({
  db,
  projectId,
});
export const updateDocumentVisibility = updateDocumentVisibilityController({
  db,
  projectId,
});
