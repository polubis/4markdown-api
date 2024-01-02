import { DocEntityField, PrivateDocEntityField } from '../entities/doc.entity';
import type { Id } from '../entities/general';

type CreateDocDto = PrivateDocEntityField & { id: Id };

type UpdateDocDto = DocEntityField & { id: Id };

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
