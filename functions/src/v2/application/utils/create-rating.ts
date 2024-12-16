import { RateModel } from '../../domain/models/rate';

const createRating = (
  rating: Partial<RateModel['rating']> = {},
): RateModel['rating'] => ({
  ugly: 0,
  bad: 0,
  decent: 0,
  good: 0,
  perfect: 0,
  ...rating,
});

export { createRating };
