import { z } from 'zod';
import { UpdateDocPayload } from './update-doc.payload';
import { UpdateDocDto } from './update-doc.dto';
import { IUid } from '../shared/entities/defs';

type IUpdateDocPayload = z.infer<typeof UpdateDocPayload>;
type IUpdateDocDto = z.infer<typeof UpdateDocDto>;

type IUpdateDocService = {
  update(uid: IUid, payload: IUpdateDocPayload): Promise<IUpdateDocDto>;
};

export type { IUpdateDocPayload, IUpdateDocDto, IUpdateDocService };
