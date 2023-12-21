import type { DocEntityField } from '../entities/doc.entity';
import type { Id } from '../entities/general';

interface CreateDocPayload extends Pick<DocEntityField, 'name' | 'code'> {}

type UpdateDocPayload = Pick<DocEntityField, 'name' | 'code' | 'visibility'> & {
  id: Id;
};

type DeleteDocPayload = { id: Id };

type GetDocPayload = { id: Id };

export type {
  CreateDocPayload,
  UpdateDocPayload,
  DeleteDocPayload,
  GetDocPayload,
};
