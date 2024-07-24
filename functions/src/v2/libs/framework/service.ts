import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
} from 'firebase-admin/firestore';

type ServiceResult<TModel> = Promise<{
  data: TModel | undefined;
  ref: DocumentReference<DocumentData>;
}>;

type Service<TPayload extends Record<string, any>, TModel> = (
  payload: TPayload & {
    action?: (
      ref: DocumentReference<DocumentData>,
    ) => Promise<DocumentSnapshot<DocumentData>>;
  },
) => ServiceResult<TModel>;

export type { Service };
