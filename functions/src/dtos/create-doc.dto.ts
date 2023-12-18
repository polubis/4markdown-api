import type { Id } from '../entities/general';

interface CreateDocDto {
  id: Id;
}

interface UpdateDocDto {
  id: Id;
}

export type { CreateDocDto, UpdateDocDto };
