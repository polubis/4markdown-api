import type { Date } from '@utils/validators';

const enum Rate {
  Ugly = `ugly`,
  Bad = `bad`,
  Decent = `decent`,
  Good = `good`,
  Perfect = `perfect`,
}

const RATING_CATEGORIES = [
  Rate.Ugly,
  Rate.Bad,
  Rate.Decent,
  Rate.Good,
  Rate.Perfect,
] as const;

type RateCategory = (typeof RATING_CATEGORIES)[number];

type RateModel = {
  rating: Record<RateCategory, number>;
  cdate: Date;
  mdate: Date;
};

export { RATING_CATEGORIES };
export type { RateModel, RateCategory };
