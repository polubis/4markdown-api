import { type Date, type Id } from '@utils/validators';

type PermanentMindmapModel = {
  authorId: Id;
  mindmapId: Id;
  cdate: Date;
};

export type { PermanentMindmapModel };
