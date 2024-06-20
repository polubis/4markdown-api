type DocumentValueBase = {
  code: string;
  name: string;
  cdate: string;
  mdate: string;
};

type PrivateDocumentValue = DocumentValueBase & {
  visibility: `private`;
};

type PublicDocumentValue = DocumentValueBase & {
  visibility: `public`;
};

type PermanentDocumentValue = DocumentValueBase & {
  visibility: `permanent`;
  description: string;
  path: string;
  tags?: string[];
};

type DocumentModel =
  | PrivateDocumentValue
  | PublicDocumentValue
  | PermanentDocumentValue;

// { [id: string]: DocumentObject }
type DocumentsModel = Record<string, DocumentModel>;

export type { DocumentsModel, DocumentModel };
