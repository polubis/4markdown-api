import { z } from 'zod';
import { CreateDocPayload } from './create-doc.payload';

type ICreateDocPayload = z.infer<typeof CreateDocPayload>;

export type { ICreateDocPayload };
