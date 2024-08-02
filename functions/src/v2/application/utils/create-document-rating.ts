import { DocumentRateModel } from '../../domain/models/document-rate';

const createDocumentRating = (
  rating: Partial<DocumentRateModel['rating']> = {},
): DocumentRateModel['rating'] => ({
  ugly: 0,
  bad: 0,
  decent: 0,
  good: 0,
  perfect: 0,
  ...rating,
});

export { createDocumentRating };
