import type { DocEntityField } from '../entities/doc.entity';
import type { Id } from '../entities/general';

interface CreateDocPayload extends Pick<DocEntityField, 'name' | 'code'> {}

type UpdateDocPayload = DocEntityField & { id: Id };

export type { CreateDocPayload, UpdateDocPayload };
