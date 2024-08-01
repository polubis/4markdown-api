import type { Id } from '../../application/utils/validators';
import type { DocumentRateCategory } from './document-rate';

type UserDocumentsVotesModel = Record<Id, DocumentRateCategory>;

export type { UserDocumentsVotesModel };
