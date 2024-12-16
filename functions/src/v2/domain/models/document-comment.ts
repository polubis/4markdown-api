import { type Date, type Id } from '@utils/validators';
import { type RateModel } from './rate';

type DocumentCommentModel = {
  authorId: Id;
  cdate: Date;
  mdate: Date;
  rating: RateModel['rating'];
  content: string;
  replies: Omit<DocumentCommentModel, 'replies'>[];
};

export type { DocumentCommentModel };
