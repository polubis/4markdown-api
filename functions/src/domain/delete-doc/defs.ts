import { z } from 'zod';
import { IUid } from '../shared/entities/defs';
import { DeleteDocPayload } from './delete-doc.payload';
import { DeleteDocDto } from './delete-doc.dto';

type IDeleteDocPayload = z.infer<typeof DeleteDocPayload>;
type IDeleteDocDto = z.infer<typeof DeleteDocDto>;

type IDeleteDocService = {
  delete(uid: IUid, payload: IDeleteDocPayload): Promise<IDeleteDocDto>;
};

export type { IDeleteDocService, IDeleteDocPayload, IDeleteDocDto };
