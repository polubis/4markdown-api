import { z } from 'zod';
import { CreateDocPayload } from './create-doc.payload';
import { IId, IPrivateDocEntityField, IUid } from '../shared/entities/defs';

type ICreateDocPayload = z.infer<typeof CreateDocPayload>;
type ICreateDocDto = Pick<
  IPrivateDocEntityField,
  'cdate' | 'code' | 'mdate' | 'name' | 'visibility'
> & { id: IId };

type ICreateDocService = {
  create(uid: IUid, payload: ICreateDocPayload): Promise<ICreateDocDto>;
};

export type { ICreateDocPayload, ICreateDocDto, ICreateDocService };
