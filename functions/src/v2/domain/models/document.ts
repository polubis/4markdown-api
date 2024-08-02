import type { Id, Date } from '../../application/utils/validators';

type DocumentModelBase = {
  code: string;
  name: string;
  cdate: Date;
  mdate: Date;
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

type DocumentsModel = Record<Id, DocumentModel>;

export type {
  DocumentsModel,
  DocumentModel,
  PrivateDocumentModel,
  PublicDocumentModel,
  PermanentDocumentModel,
};
