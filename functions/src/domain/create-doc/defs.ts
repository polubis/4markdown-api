import { z } from 'zod';
import { CreateDocPayload } from './create-doc.payload';
import { CreateDocDto } from './create-doc.dto';

type ICreateDocPayload = z.infer<typeof CreateDocPayload>;
type ICreateDocDto = z.infer<typeof CreateDocDto>;

export type { ICreateDocPayload, ICreateDocDto };
