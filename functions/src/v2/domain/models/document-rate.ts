const DOCUMENT_RATING_CATEGORIES = [
  `ugly`,
  `bad`,
  `decent`,
  `good`,
  `perfect`,
] as const;

type DocumentRateCategory = (typeof DOCUMENT_RATING_CATEGORIES)[number];

type DocumentRateModel = {
  id: string;
  rating: Record<DocumentRateCategory, number>;
  voters: Record<string, boolean>;
  cdate: string;
  mdate: string;
};

export { DOCUMENT_RATING_CATEGORIES };
export type { DocumentRateModel, DocumentRateCategory };
