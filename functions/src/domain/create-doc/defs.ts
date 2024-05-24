import { z } from 'zod';
import { CreateDocPayload } from './create-doc.payload';
import { CreateDocDto } from './create-doc.dto';
import { IUid } from '../shared/entities/defs';

type ICreateDocPayload = z.infer<typeof CreateDocPayload>;
type ICreateDocDto = z.infer<typeof CreateDocDto>;

type ICreateDocService = {
  create(uid: IUid, payload: ICreateDocPayload): Promise<ICreateDocDto>;
};

export type { ICreateDocPayload, ICreateDocDto, ICreateDocService };
