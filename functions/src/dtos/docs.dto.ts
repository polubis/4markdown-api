import { DocEntityField } from '../entities/doc.entity';
import type { Id } from '../entities/general';

interface CreateDocDto {
  id: Id;
}

interface UpdateDocDto {
  id: Id;
}

type GetDocsDtoItem = DocEntityField & { id: Id };

type GetDocsDto = GetDocsDtoItem[];

export type { CreateDocDto, UpdateDocDto, GetDocsDto, GetDocsDtoItem };
