import { z } from 'zod';
import { DocEntity, DocEntityField, PrivateDocEntityField } from './doc.entity';
import { EntityName, Id, Uid } from './atoms';

type IDocEntity = z.infer<typeof DocEntity>;
type IDocEntityField = z.infer<typeof DocEntityField>;
type IPrivateDocEntityField = z.infer<typeof PrivateDocEntityField>;

type IId = z.infer<typeof Id>;

type IUid = z.infer<typeof Uid>;

type IEntityName = z.infer<typeof EntityName>;

export type {
  IDocEntity,
  IId,
  IUid,
  IEntityName,
  IDocEntityField,
  IPrivateDocEntityField,
};
