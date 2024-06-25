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
type DocumentsModel = Record<string, DocumentModel>;

export type {
  DocumentsModel,
  DocumentModel,
  PrivateDocumentModel,
  PublicDocumentModel,
  PermanentDocumentModel,
};
