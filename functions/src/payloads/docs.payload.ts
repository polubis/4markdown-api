import type {
  DocEntityField,
  PrivateDocEntityField,
  PublicDocEntityField,
  PermanentDocEntityField,
} from '../entities/doc.entity';
import type { Id, Tags } from '../entities/general';

interface CreateDocPayload extends Pick<DocEntityField, 'name' | 'code'> {}

type UpdateDocPrivatePayload = Pick<
  PrivateDocEntityField,
  'name' | 'code' | 'visibility'
> & { id: Id };

type UpdateDocPublicPayload = Pick<
  PublicDocEntityField,
  'name' | 'code' | 'visibility'
> & { id: Id };

type UpdateDocPermanentPayload = Pick<
  PermanentDocEntityField,
  'name' | 'code' | 'visibility' | 'description'
> & { id: Id; tags: Tags };

type UpdateDocPayload =
  | UpdateDocPrivatePayload
  | UpdateDocPublicPayload
  | UpdateDocPermanentPayload;

type DeleteDocPayload = { id: Id };

type GetDocPayload = { id: Id };

export type {
  CreateDocPayload,
  UpdateDocPayload,
  DeleteDocPayload,
  GetDocPayload,
};
