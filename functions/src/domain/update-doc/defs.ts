import { z } from 'zod';
import {
  UpdateDocPayload,
  UpdatePermanentDocPayload,
} from './update-doc.payload';
import {
  IId,
  IPrivateDocEntityField,
  IPublicDocEntityField,
  IUid,
} from '../shared/entities/defs';
import { PermanentDocEntityField } from '../../entities/doc.entity';

type IUpdatePrivateDocDto = Pick<
  IPrivateDocEntityField,
  'cdate' | 'code' | 'mdate' | 'name' | 'visibility'
> & { id: IId };
type IUpdatePublicDocDto = Pick<
  IPublicDocEntityField,
  'cdate' | 'code' | 'mdate' | 'name' | 'visibility'
> & { id: IId };
type IUpdatePermamentDocDto = Pick<
  PermanentDocEntityField,
  | 'cdate'
  | 'code'
  | 'description'
  | 'mdate'
  | 'name'
  | 'path'
  | 'tags'
  | 'visibility'
> & { id: IId };

type IUpdateDocDto = IUpdatePrivateDocDto | IUpdatePublicDocDto;

type IUpdateDocPayload = z.infer<typeof UpdateDocPayload>;
type IUpdatePermanentDocPayload = z.infer<typeof UpdatePermanentDocPayload>;

type IUpdateDocService = {
  update(uid: IUid, payload: IUpdateDocPayload): Promise<IUpdateDocDto>;
};

export type {
  IUpdateDocPayload,
  IUpdateDocDto,
  IUpdateDocService,
  IUpdatePermanentDocPayload,
  IUpdatePermamentDocDto,
  IUpdatePrivateDocDto,
  IUpdatePublicDocDto,
};
