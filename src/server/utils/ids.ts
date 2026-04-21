import { ObjectId } from 'mongodb';
import { BadRequestError } from '@/server/models/errors';

export function toObjectId(value: string) {
  if (!ObjectId.isValid(value)) {
    throw new BadRequestError(`Invalid MongoDB ObjectId: ${value}`);
  }

  return new ObjectId(value);
}

export function isObjectIdLike(value: string) {
  return ObjectId.isValid(value);
}
