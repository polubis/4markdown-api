import { firestore } from 'firebase-admin';
import { IDocEntity, IEntityName, IUid } from '../entities/defs';

type ICollection = firestore.CollectionReference<firestore.DocumentData>;
type ICollectionGetter = (
  db: firestore.Firestore,
  name: IEntityName,
) => ICollection;

type IDocsRepository = {
  getEntity(uid: IUid): Promise<IDocEntity | undefined>;
  setEntity(uid: IUid, entity: IDocEntity): Promise<void>;
};
type IDocsRepositoryFactory = () => IDocsRepository;

export type {
  ICollection,
  ICollectionGetter,
  IDocsRepository,
  IDocsRepositoryFactory,
};
