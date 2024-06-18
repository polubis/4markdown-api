import type {
  DocEntityField,
  PrivateDocEntityField,
  PublicDocEntityField,
  PermanentDocEntityField,
} from '../entities/doc.entity';
import type { Id, Tags } from '../entities/general';

interface CreateDocPayload extends Pick<DocEntityField, 'name' | 'code'> {}

type ThumbnailAction =
  | {
      type: `noop`;
    }
  | { type: `remove` }
  | { type: `update`; data: string };

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
> & {
  id: Id;
  tags: Tags;
  thumbnail: ThumbnailAction;
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
  ThumbnailAction,
};
