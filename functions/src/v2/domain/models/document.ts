import type { Id, Date } from '@utils/validators';

const enum DocumentModelVisibility {
  Private = `private`,
  Public = `public`,
  Permanent = `permanent`,
}

type DocumentModelBase = {
  code: string;
  name: string;
  cdate: Date;
  mdate: Date;
  path: string;
};

type PrivateDocumentModel = DocumentModelBase & {
  visibility: DocumentModelVisibility.Private;
};

type PublicDocumentModel = DocumentModelBase & {
  visibility: DocumentModelVisibility.Public;
};

type PermanentDocumentModel = DocumentModelBase & {
  visibility: DocumentModelVisibility.Permanent;
  description: string;
  tags: string[];
};

type DocumentModel =
  | PrivateDocumentModel
  | PublicDocumentModel
  | PermanentDocumentModel;

type DocumentsModel = Record<Id, DocumentModel>;

export { DocumentModelVisibility };
export type {
  DocumentsModel,
  DocumentModel,
  PrivateDocumentModel,
  PublicDocumentModel,
  PermanentDocumentModel,
};
