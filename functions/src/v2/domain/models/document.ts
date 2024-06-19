type DocumentModelObjectBase = {
  code: string;
  name: string;
  cdate: string;
  mdate: string;
};

type PrivateDocumentObjectModel = DocumentModelObjectBase & {
  visibility: `private`;
};

type PublicDocumentObjectModel = DocumentModelObjectBase & {
  visibility: `public`;
};

type PermanentDocumentObjectModel = DocumentModelObjectBase & {
  visibility: `permanent`;
  description: string;
  path: string;
  tags?: string[];
};

type DocumentObjectModel =
  | PrivateDocumentObjectModel
  | PublicDocumentObjectModel
  | PermanentDocumentObjectModel;

type DocumentModel = Record<string, DocumentObjectModel>;

export type { DocumentModel, DocumentObjectModel };
