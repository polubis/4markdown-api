import type { Date } from '../../application/utils/validators';

const DOCUMENT_RATING_CATEGORIES = [
  `ugly`,
  `bad`,
  `decent`,
  `good`,
  `perfect`,
] as const;

type DocumentRateCategory = (typeof DOCUMENT_RATING_CATEGORIES)[number];

type DocumentRateModel = {
  rating: Record<DocumentRateCategory, number>;
  cdate: Date;
  mdate: Date;
};

export { DOCUMENT_RATING_CATEGORIES };
export type { DocumentRateModel, DocumentRateCategory };
