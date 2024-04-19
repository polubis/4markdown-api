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
  'name' | 'code' | 'visibility' | 'mdate'
> & { id: Id };

type UpdateDocPublicPayload = Pick<
  PublicDocEntityField,
  'name' | 'code' | 'visibility' | 'mdate'
> & { id: Id };

type UpdateDocPermamentThumbnailNoopAction = {
  action: 'noop';
};

type UpdateDocPermamentThumbnailUpdateAction = {
  action: 'update';
  data: unknown;
};

type UpdateDocPermanentPayload = Pick<
  PermanentDocEntityField,
  'name' | 'code' | 'visibility' | 'description' | 'mdate'
> & {
  id: Id;
  tags: Tags;
  thumbnail:
    | UpdateDocPermamentThumbnailNoopAction
    | UpdateDocPermamentThumbnailUpdateAction;
};

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
  UpdateDocPermamentThumbnailNoopAction,
  UpdateDocPermamentThumbnailUpdateAction,
};
