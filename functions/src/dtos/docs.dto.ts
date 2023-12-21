import { DocEntityField } from '../entities/doc.entity';
import type { Id } from '../entities/general';

interface CreateDocDto
  extends Pick<
    DocEntityField,
    'cdate' | 'code' | 'mdate' | 'name' | 'visibility'
  > {
  id: Id;
}

interface UpdateDocDto
  extends Pick<
    DocEntityField,
    'cdate' | 'code' | 'mdate' | 'name' | 'visibility'
  > {
  id: Id;
}

type GetDocsDtoItem = DocEntityField & { id: Id };

type GetDocsDto = GetDocsDtoItem[];

type DeleteDocDto = { id: Id };

type GetDocDto = DocEntityField & { id: Id };

export type {
  CreateDocDto,
  UpdateDocDto,
  GetDocsDto,
  GetDocsDtoItem,
  GetDocDto,
  DeleteDocDto,
};
