import { DocEntityField } from '../entities/doc.entity';
import type { Id } from '../entities/general';

interface CreateDocDto {
  id: Id;
}

interface UpdateDocDto {
  id: Id;
}

type GetDocsDto = (DocEntityField & { id: Id })[];

export type { CreateDocDto, UpdateDocDto, GetDocsDto };
