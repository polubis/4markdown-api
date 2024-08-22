import {
  PermanentDocEntityField,
  PrivateDocEntityField,
  PublicDocEntityField,
} from '../entities/doc.entity';
import type { Id, Tags } from '../entities/general';
import { IUserProfileDto } from './users-profiles.dto';

type DocAuthorDto = IUserProfileDto | null;

type UpdateDocPublicDto = PublicDocEntityField & { id: Id };
type UpdateDocPrivateDto = PrivateDocEntityField & { id: Id };
type UpdateDocPermanentDto = Omit<PermanentDocEntityField, 'tags'> & {
  id: Id;
  tags: Tags;
};

type UpdateDocDto =
  | UpdateDocPublicDto
  | UpdateDocPrivateDto
  | UpdateDocPermanentDto;

type GetDocDto =
  | (PublicDocEntityField & { id: Id; author: DocAuthorDto })
  | (PrivateDocEntityField & { id: Id })
  | (Omit<PermanentDocEntityField, 'tags'> & {
      id: Id;
      tags: Tags;
      author: DocAuthorDto;
    });

type GetDocsDtoItem = GetDocDto;

type GetDocsDto = GetDocsDtoItem[];

type DeleteDocDto = { id: Id };

export type {
  UpdateDocDto,
  UpdateDocPublicDto,
  UpdateDocPrivateDto,
  UpdateDocPermanentDto,
  GetDocsDto,
  GetDocsDtoItem,
  DocAuthorDto,
  GetDocDto,
  DeleteDocDto,
};
