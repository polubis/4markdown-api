import type {
  PermanentDocEntityField,
  PrivateDocEntityField,
  PublicDocEntityField,
} from '../entities/doc.entity';
import type { Id, Tags } from '../entities/general';
import type { IUserProfileDto } from './users-profiles.dto';

type IDocAuthorDto = IUserProfileDto | null;

type CreateDocDto = PrivateDocEntityField & { id: Id };

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
  | (PublicDocEntityField & { id: Id })
  | (PrivateDocEntityField & { id: Id })
  | (Omit<PermanentDocEntityField, 'tags'> & { id: Id; tags: Tags });

type GetDocsDtoItem = GetDocDto;

type GetDocsDto = GetDocsDtoItem[];

type DeleteDocDto = { id: Id };

type GetPermanentDocsDto = (Omit<PermanentDocEntityField, 'tags'> & {
  id: Id;
  tags: Tags;
  author: IDocAuthorDto;
})[];

export type {
  CreateDocDto,
  UpdateDocDto,
  UpdateDocPublicDto,
  UpdateDocPrivateDto,
  UpdateDocPermanentDto,
  GetDocsDto,
  GetDocsDtoItem,
  GetDocDto,
  GetPermanentDocsDto,
  DeleteDocDto,
  IDocAuthorDto,
};
