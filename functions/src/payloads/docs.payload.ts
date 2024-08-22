import type {
  PrivateDocEntityField,
  PublicDocEntityField,
  PermanentDocEntityField,
} from '../entities/doc.entity';
import type { Id, Tags } from '../entities/general';

type UpdateDocPrivatePayload = Pick<
  PrivateDocEntityField,
  'name' | 'code' | 'visibility' | 'mdate'
> & { id: Id };

type UpdateDocPublicPayload = Pick<
  PublicDocEntityField,
  'name' | 'code' | 'visibility' | 'mdate'
> & { id: Id };

type UpdateDocPermanentPayload = Pick<
  PermanentDocEntityField,
  'name' | 'code' | 'visibility' | 'description' | 'mdate'
> & { id: Id; tags: Tags };

type UpdateDocPayload =
  | UpdateDocPrivatePayload
  | UpdateDocPublicPayload
  | UpdateDocPermanentPayload;

type DeleteDocPayload = { id: Id };

type GetDocPayload = { id: Id };

export type { UpdateDocPayload, DeleteDocPayload, GetDocPayload };
