import type { DocEntityField } from '../entities/doc.entity';

interface CreateDocPayload extends Pick<DocEntityField, 'name' | 'code'> {}

interface UpdateDocPayload extends DocEntityField {}

export type { CreateDocPayload, UpdateDocPayload };
