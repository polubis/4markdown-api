import {
  DocEntityField,
  PermanentDocEntityField,
  PrivateDocEntityField,
  PublicDocEntityField,
} from '../entities/doc.entity';
import type { Id } from '../entities/general';

type CreateDocDto = PrivateDocEntityField & { id: Id };

type UpdateDocPublicDto = PublicDocEntityField & { id: Id };
type UpdateDocPrivateDto = PrivateDocEntityField & { id: Id };
type UpdateDocPermanentDto = PermanentDocEntityField & { id: Id };

type UpdateDocDto =
  | UpdateDocPublicDto
  | UpdateDocPrivateDto
  | UpdateDocPermanentDto;

type GetDocsDtoItem = DocEntityField & { id: Id };

type GetDocsDto = GetDocsDtoItem[];

type DeleteDocDto = { id: Id };

type GetDocDto = DocEntityField & { id: Id };

export type {
  CreateDocDto,
  UpdateDocDto,
  UpdateDocPublicDto,
  UpdateDocPrivateDto,
  UpdateDocPermanentDto,
  GetDocsDto,
  GetDocsDtoItem,
  GetDocDto,
  DeleteDocDto,
};
