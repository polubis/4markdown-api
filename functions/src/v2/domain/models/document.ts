import { z } from 'zod';
import { validators } from '../../application/utils/validators';

type DocumentModelBase = {
  code: string;
  name: string;
  cdate: string;
  mdate: string;
};

type PrivateDocumentModel = DocumentModelBase & {
  visibility: `private`;
};

type PublicDocumentModel = DocumentModelBase & {
  visibility: `public`;
};

type PermanentDocumentModel = DocumentModelBase & {
  visibility: `permanent`;
  description: string;
  path: string;
  tags?: string[];
};

type DocumentModel =
  | PrivateDocumentModel
  | PublicDocumentModel
  | PermanentDocumentModel;

// { [id: string]: DocumentObject }
type DocumentModelId = z.infer<typeof validators.id>;
type DocumentsModel = Record<DocumentModelId, DocumentModel>;

export type {
  DocumentsModel,
  DocumentModel,
  PrivateDocumentModel,
  PublicDocumentModel,
  PermanentDocumentModel,
  DocumentModelId,
};
