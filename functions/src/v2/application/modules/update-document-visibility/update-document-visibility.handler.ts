import { nowISO, uuid } from '@libs/helpers/stamps';
import {
  DocumentModelVisibility,
  type DocumentModel,
  type DocumentsModel,
} from '@domain/models/document';
import { errors } from '@utils/errors';

import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type UpdateDocumentVisibilityPayload,
  type UpdateDocumentVisibilityDto,
} from './update-document-visibility.contract';

const updateDocumentVisibilityHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: UpdateDocumentVisibilityPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateDocumentVisibilityDto> => {};

export { updateDocumentVisibilityHandler };
