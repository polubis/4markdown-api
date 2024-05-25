import { z } from 'zod';
import { IId, IUid } from '../shared/entities/defs';
import { DeleteDocPayload } from './delete-doc.payload';

type IDeleteDocPayload = z.infer<typeof DeleteDocPayload>;
type IDeleteDocDto = { id: IId };

type IDeleteDocService = {
  delete(uid: IUid, payload: IDeleteDocPayload): Promise<IDeleteDocDto>;
};

export type { IDeleteDocService, IDeleteDocPayload, IDeleteDocDto };
