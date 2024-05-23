import { z } from 'zod';
import { DocEntity } from './doc.entity';

type IDocEntity = z.infer<typeof DocEntity>;

export type { IDocEntity };
