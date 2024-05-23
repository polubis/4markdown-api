import { z } from 'zod';
import { DocEntity } from './doc.entity';
import { Id } from './atoms';

type IDocEntity = z.infer<typeof DocEntity>;

type IId = z.infer<typeof Id>;

export type { IDocEntity, IId };
