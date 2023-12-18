import type { DocEntityField } from '../entities/doc.entity';

interface CreateDocDto extends Pick<DocEntityField, 'id'> {}

interface UpdateDocDto extends Pick<DocEntityField, 'id'> {}

export type { CreateDocDto, UpdateDocDto };
