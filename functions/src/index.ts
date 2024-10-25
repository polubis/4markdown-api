import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DocsService } from './services/docs.service';
import { AuthService } from './services/auth.service';
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

const app = admin.initializeApp();
const db = app.firestore();
// @TODO: Use admin.auth() once and inject it to controllers.

const { onCall } = https;

export const updateDoc = onCall(async (request) => {
  const user = AuthService.authorize({ auth: request.auth });
  return DocsService.update(user.uid, request.data);
});

export const uploadImage = onCall(async (request) => {
  return await UsersService.uploadImage({
    payload: request.data,
    context: {
      auth: request.auth,
    },
  });
});

export const updateYourUserProfile = onCall<unknown>(async (request) => {
  return await UsersProfilesService.updateYour({
    payload: request.data,
    context: {
      auth: request.auth,
    },
  });
});

export const getYourUserProfile = onCall<unknown>(async (request) => {
  return await UsersProfilesService.getYour({
    context: {
      auth: request.auth,
    },
  });
});

export const updateDocumentCode = updateDocumentCodeController(db);
export const rateDocument = rateDocumentController(db);
export const deleteDocument = deleteDocumentController(db);
export const getPermanentDocuments = getPermanentDocumentsController(db);
export const getAccessibleDocument = getAccessibleDocumentController(db);
export const createDocument = createDocumentController(db);
export const getYourDocuments = getYourDocumentsController(db);
export const updateDocumentName = updateDocumentNameController(db);
