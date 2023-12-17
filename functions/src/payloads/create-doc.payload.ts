import type { DocEntityField } from '../entities/doc.entity';

interface CreatePayload extends Pick<DocEntityField, 'name' | 'code'> {}

export type { CreatePayload };
