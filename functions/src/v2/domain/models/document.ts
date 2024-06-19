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

type DocumentModelValue =
  | PrivateDocumentValue
  | PublicDocumentValue
  | PermanentDocumentValue;

// { [id: string]: DocumentObject }
type DocumentModel = Record<string, DocumentModelValue>;

export type { DocumentModel, DocumentModelValue };
