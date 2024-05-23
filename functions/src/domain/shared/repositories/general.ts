import { EntityName } from '../entities/atoms';
import { ICollectionGetter } from './defs';

const getCollection: ICollectionGetter = (db, name) =>
  db.collection(EntityName.parse(name));

export { getCollection };
