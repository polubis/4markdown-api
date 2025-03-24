import 'module-alias/register';
import * as admin from 'firebase-admin';
import { updateDocumentCodeController } from './v2/application/modules/update-document-code/update-document-code.controller';
import { rateDocumentController } from './v2/application/modules/rate-document/rate-document.controller';
import { deleteDocumentController } from './v2/application/modules/delete-document/delete-document.controller';
import { getPermanentDocumentsController } from './v2/application/modules/get-permanent-documents/get-permanent-documents.controller';
import { getAccessibleDocumentController } from './v2/application/modules/get-accessible-document/get-accessible-document.controller';
import { createDocumentController } from './v2/application/modules/create-document/create-document.controller';
import { getYourDocumentsController } from './v2/application/modules/get-your-documents/get-your-documents.controller';
import { updateDocumentNameController } from './v2/application/modules/update-document-name/update-document-name.controller';
import { updateDocumentVisibilityController } from '@modules/update-document-visibility/update-document-visibility.controller';
import { migrateDatabaseController } from '@modules/migrate-database/migrate-database.controller';
import { uploadImageController } from '@modules/upload-image/upload-image.controller';
import { addDocumentCommentController } from '@modules/add-document-comment/add-document-comment.controller';
import { getDocumentCommentsController } from '@modules/get-document-comments/get-document-comments.controller';
import { editDocumentCommentController } from '@modules/edit-document-comment/edit-document-comment.controller';
import { deleteDocumentCommentController } from '@modules/delete-document-comment/delete-document-comment.controller';
import { getYourUserProfileController } from '@modules/get-your-user-profile/get-your-user-profile.controller';
import { updateYourUserProfileController } from '@modules/update-your-user-profile/update-your-user-profile.controller';
import { getYourMindmapsController } from '@modules/get-your-mindmaps';
import { updateMindmapNameController } from '@modules/update-mindmap-name';
import { updateMindmapShapeController } from '@modules/update-mindmap-shape';
import { deleteMindmapController } from '@modules/delete-mindmap';
import { updateMindmapVisibilityController } from '@modules/update-mindmap-visibility';
import { updateMindmapController } from '@modules/update-mindmap';
import { createMindmapController } from '@modules/create-mindmap';
import { getAccessibleMindmapController } from '@modules/get-accessible-mindmap';
import { reportBugController } from '@modules/report-bug';
import { getPermanentMindmapsController } from '@modules/get-permanent-mindmaps';
import { createBackupController } from '@modules/create-backup';

const app = admin.initializeApp();
const db = app.firestore();
const projectId = app.options.projectId!;

export const getYourUserProfile = getYourUserProfileController({
  db,
  projectId,
});
export const updateYourUserProfileV2 = updateYourUserProfileController({
  db,
  projectId,
});

export const deleteDocumentComment = deleteDocumentCommentController({
  db,
  projectId,
});
export const editDocumentComment = editDocumentCommentController({
  db,
  projectId,
});
export const addDocumentComment = addDocumentCommentController({
  db,
  projectId,
});
export const getDocumentComments = getDocumentCommentsController({
  db,
  projectId,
});
export const uploadImage = uploadImageController({
  db,
  projectId,
});
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

export const migrateDatabase = migrateDatabaseController({
  db,
  projectId,
  secrets: [`ADMIN_LIST`],
});

export const createMindmap = createMindmapController({
  db,
  projectId,
});

export const updateMindmapName = updateMindmapNameController({
  db,
  projectId,
});

export const updateMindmapShape = updateMindmapShapeController({
  db,
  projectId,
});

export const getYourMindmaps = getYourMindmapsController({
  db,
  projectId,
});

export const deleteMindmap = deleteMindmapController({
  db,
  projectId,
});

export const updateMindmapVisibility = updateMindmapVisibilityController({
  db,
  projectId,
});

export const updateMindmap = updateMindmapController({
  db,
  projectId,
});

export const getAccessibleMindmap = getAccessibleMindmapController({
  db,
  projectId,
});

export const reportBug = reportBugController({
  db,
  projectId,
});

export const getPermanentMindmaps = getPermanentMindmapsController({
  db,
  projectId,
});

export const createBackup = createBackupController({
  db,
  projectId,
  secrets: [`SOURCE_BUCKET`, `BACKUP_BUCKET`, `ADMIN_LIST`],
});
