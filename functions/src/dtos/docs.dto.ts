import { DocEntityField } from '../entities/doc.entity';
import type { Id } from '../entities/general';

interface CreateDocDto
  extends Pick<DocEntityField, 'cdate' | 'code' | 'mdate' | 'name'> {
  id: Id;
}

interface UpdateDocDto
  extends Pick<DocEntityField, 'cdate' | 'code' | 'mdate' | 'name'> {
  id: Id;
}

type GetDocsDtoItem = DocEntityField & { id: Id };

type GetDocsDto = GetDocsDtoItem[];

type DeleteDocDto = { id: Id };

export type {
  CreateDocDto,
  UpdateDocDto,
  GetDocsDto,
  GetDocsDtoItem,
  DeleteDocDto,
};
